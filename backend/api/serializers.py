from rest_framework import serializers
from .models import Profile, SkillAssessment, CourseRecommendation, SkillSelfAssessment

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = Profile.objects.create_user(**validated_data)
        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'full_name', 'age', 'highest_education', 'skills', 'areas_of_interest', 'career_goals']

class SkillSelfAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillSelfAssessment
        fields = ['programming', 'communication', 'problem_solving', 'design_thinking']