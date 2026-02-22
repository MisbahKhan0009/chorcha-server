from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DivisionViewSet, GroupViewSet, SubjectViewSet, QuestionSetViewSet, QuestionViewSet

router = DefaultRouter()
router.register(r'divisions', DivisionViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'question-sets', QuestionSetViewSet)
router.register(r'questions', QuestionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
