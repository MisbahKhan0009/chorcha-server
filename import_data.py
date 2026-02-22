import os
import json
import mysql.connector
from mysql.connector import Error

# Database Configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',  # Replace with your MySQL username
    'password': '',  # Replace with your MySQL password
    'database': 'chorcha_db'
}

def create_database():
    try:
        conn = mysql.connector.connect(host=DB_CONFIG['host'], user=DB_CONFIG['user'], password=DB_CONFIG['password'])
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        conn.commit()
        cursor.close()
        conn.close()
    except Error as e:
        print(f"Error creating database: {e}")

def setup_schema():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Create tables based on the plan
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS divisions (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `groups` (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS subjects (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                division_id INT UNSIGNED NOT NULL,
                group_id INT UNSIGNED NOT NULL,
                name VARCHAR(100) NOT NULL,
                FOREIGN KEY (division_id) REFERENCES divisions(id),
                FOREIGN KEY (group_id) REFERENCES `groups`(id),
                UNIQUE KEY uk_div_group_sub (division_id, group_id, name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS question_sets (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                subject_id INT UNSIGNED NOT NULL,
                title VARCHAR(255) NOT NULL,
                read_id VARCHAR(50),
                question_count INT UNSIGNED DEFAULT 0,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS questions (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                set_id INT UNSIGNED NOT NULL,
                question_text TEXT NOT NULL,
                number VARCHAR(10),
                tag VARCHAR(100),
                explanation TEXT,
                correct_option_label CHAR(1),
                FOREIGN KEY (set_id) REFERENCES question_sets(id) ON DELETE CASCADE,
                FULLTEXT INDEX ft_question (question_text)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS options (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                question_id INT UNSIGNED NOT NULL,
                label CHAR(1) NOT NULL,
                option_text TEXT NOT NULL,
                is_correct TINYINT(1) NOT NULL DEFAULT 0,
                FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
    except Error as e:
        print(f"Error setting up schema: {e}")

def get_or_create(cursor, table, name_val, unique_col='name'):
    cursor.execute(f"SELECT id FROM `{table}` WHERE `{unique_col}` = %s", (name_val,))
    result = cursor.fetchone()
    if result:
        return result[0]
    else:
        cursor.execute(f"INSERT INTO `{table}` (`{unique_col}`) VALUES (%s)", (name_val,))
        return cursor.lastrowid

def import_data(root_dir):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Traverse the Data folder
        for root, dirs, files in os.walk(root_dir):
            for file in files:
                if file.endswith('.json'):
                    file_path = os.path.join(root, file)
                    
                    # Extract hierarchy from path
                    # Expected path: Data/Output/MCQ/Division/Group/Subject/...
                    parts = os.path.normpath(file_path).split(os.sep)
                    if len(parts) < 7: continue
                    
                    division_name = parts[3]
                    group_name = parts[4]
                    subject_name = parts[6] # Based on observation of folder structure
                    
                    # Get IDs
                    div_id = get_or_create(cursor, 'divisions', division_name)
                    grp_id = get_or_create(cursor, 'groups', group_name)
                    
                    # Get or create subject
                    cursor.execute("SELECT id FROM subjects WHERE division_id = %s AND group_id = %s AND name = %s", 
                                 (div_id, grp_id, subject_name))
                    sub_res = cursor.fetchone()
                    if sub_res:
                        sub_id = sub_res[0]
                    else:
                        cursor.execute("INSERT INTO subjects (division_id, group_id, name) VALUES (%s, %s, %s)", 
                                     (div_id, grp_id, subject_name))
                        sub_id = cursor.lastrowid
                    
                    # Load JSON
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # Create question set
                    cursor.execute("INSERT INTO question_sets (subject_id, title, read_id, question_count) VALUES (%s, %s, %s, %s)",
                                 (sub_id, data.get('title', ''), data.get('read_id', ''), data.get('count', 0)))
                    set_id = cursor.lastrowid
                    
                    # Insert questions and options
                    for q in data.get('questions', []):
                        cursor.execute("""
                            INSERT INTO questions (set_id, question_text, number, tag, explanation, correct_option_label)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (set_id, q.get('question', ''), q.get('number', ''), q.get('tag', ''), 
                              q.get('explanation', ''), q.get('correct', '')))
                        q_id = cursor.lastrowid
                        
                        for opt in q.get('options', []):
                            cursor.execute("""
                                INSERT INTO options (question_id, label, option_text, is_correct)
                                VALUES (%s, %s, %s, %s)
                            """, (q_id, opt.get('label', ''), opt.get('text', ''), 1 if opt.get('is_correct') else 0))
                    
                    print(f"Imported: {file_path}")
                    conn.commit()
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error during import: {e}")

if __name__ == "__main__":
    create_database()
    setup_schema()
    import_data('Data/Output/MCQ')
