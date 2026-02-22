from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Division, Group, Subject, QuestionSet, Question
from .serializers import (
    DivisionSerializer, GroupSerializer, SubjectSerializer, 
    QuestionSetSerializer, QuestionSetDetailSerializer, QuestionSerializer
)

class DivisionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Division.objects.all()
    serializer_class = DivisionSerializer

class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['division', 'group']
    search_fields = ['name']

class QuestionSetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = QuestionSet.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['subject']
    search_fields = ['title']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuestionSetDetailSerializer
        return QuestionSetSerializer

class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['question_text']
