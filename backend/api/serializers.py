from rest_framework import serializers
from .models import User, Profile, SkillAssessment, CourseRecommendation, SkillSelfAssessment

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'career_goal')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['degree', 'year_of_study', 'institution', 'graduation_year', 'career_interests', 'areas_of_interest']

class SkillSelfAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillSelfAssessment
        fields = ['programming', 'communication', 'problem_solving', 'design_thinking']