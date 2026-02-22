# MySQL Database Plan for MCQ Data

This document outlines the database schema and data migration strategy for the MCQ data stored in the `Data` folder.

## 1. Database Schema Design

The schema is designed to be normalized, efficient, and scalable, following MySQL best practices.

### Table: `divisions`
Stores top-level categories (e.g., SSC, HSC, HSC Admission).
```sql
CREATE TABLE divisions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table: `groups`
Stores academic groups (e.g., Science, Arts, Commerce, Common).
```sql
CREATE TABLE groups (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table: `subjects`
Links subjects to divisions and groups.
```sql
CREATE TABLE subjects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    division_id INT UNSIGNED NOT NULL,
    group_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    INDEX idx_div_group (division_id, group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table: `question_sets`
Represents a collection of questions (e.g., a specific board exam or test paper).
```sql
CREATE TABLE question_sets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    read_id VARCHAR(50),
    question_count INT UNSIGNED DEFAULT 0,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_subject (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table: `questions`
Stores individual MCQ questions.
```sql
CREATE TABLE questions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    set_id INT UNSIGNED NOT NULL,
    question_text TEXT NOT NULL,
    number VARCHAR(10),
    tag VARCHAR(100),
    explanation TEXT,
    correct_option_label CHAR(1),
    FOREIGN KEY (set_id) REFERENCES question_sets(id) ON DELETE CASCADE,
    FULLTEXT INDEX ft_question (question_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table: `options`
Stores the four choices for each question.
```sql
CREATE TABLE options (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id INT UNSIGNED NOT NULL,
    label CHAR(1) NOT NULL,
    option_text TEXT NOT NULL,
    is_correct TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 2. Data Mapping Strategy

The import script will parse the folder structure and JSON content as follows:

| Source | Target Column | Logic |
| :--- | :--- | :--- |
| Folder Path Segment 4 | `divisions.name` | e.g., `SSC` from `Data/Output/MCQ/SSC/...` |
| Folder Path Segment 5 | `groups.name` | e.g., `SSC Science` |
| Folder Path Segment 6 | `subjects.name` | e.g., `ssc-physics-test-paper-mcq` |
| JSON `title` | `question_sets.title` | Full title of the set |
| JSON `read_id` | `question_sets.read_id` | Unique identifier from source |
| JSON `questions[]` | `questions` table | Iterative insertion |
| JSON `options[]` | `options` table | Iterative insertion per question |

---

## 3. Implementation Notes
- **Charset**: `utf8mb4` is used to fully support Bengali characters.
- **Engine**: `InnoDB` for ACID compliance and row-level locking.
- **Indexing**: Full-text indexing on question text for fast searching.
