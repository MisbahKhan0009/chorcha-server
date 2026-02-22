from django.db import models

class Division(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'divisions'

    def __str__(self):
        return self.name

class Group(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'groups'

    def __str__(self):
        return self.name

class Subject(models.Model):
    division = models.ForeignKey(Division, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'subjects'
        unique_together = ('division', 'group', 'name')

    def __str__(self):
        return f"{self.name} ({self.division.name} - {self.group.name})"

class QuestionSet(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='question_sets')
    title = models.CharField(max_length=255)
    read_id = models.CharField(max_length=50, null=True, blank=True)
    question_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'question_sets'

    def __str__(self):
        return self.title

class Question(models.Model):
    set = models.ForeignKey(QuestionSet, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    number = models.CharField(max_length=10, null=True, blank=True)
    tag = models.CharField(max_length=100, null=True, blank=True)
    explanation = models.TextField(null=True, blank=True)
    correct_option_label = models.CharField(max_length=1, null=True, blank=True)

    class Meta:
        db_table = 'questions'

    def __str__(self):
        return self.question_text[:50]

class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    label = models.CharField(max_length=1)
    option_text = models.TextField()
    is_correct = models.BooleanField(default=False)

    class Meta:
        db_table = 'options'

    def __str__(self):
        return f"{self.label}: {self.option_text[:30]}"
