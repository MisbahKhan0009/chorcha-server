from rest_framework import serializers
from .models import Division, Group, Subject, QuestionSet, Question, Option

class DivisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = '__all__'

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    division_name = serializers.ReadOnlyField(source='division.name')
    group_name = serializers.ReadOnlyField(source='group.name')
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'division', 'division_name', 'group', 'group_name']

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'label', 'option_text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'number', 'tag', 'explanation', 'correct_option_label', 'options']

class QuestionSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionSet
        fields = '__all__'

class QuestionSetDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    subject_name = serializers.ReadOnlyField(source='subject.name')
    
    class Meta:
        model = QuestionSet
        fields = ['id', 'title', 'read_id', 'question_count', 'subject', 'subject_name', 'questions']
