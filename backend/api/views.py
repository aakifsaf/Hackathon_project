from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import GroupMessage
from .serializers import RegisterSerializer
import openai
from rest_framework.views import APIView
from rest_framework import status
from .serializers import ProfileSerializer, SkillSelfAssessmentSerializer

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        return Response(serializer.errors, status=400)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=400)
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        return Response({'error': 'Invalid credentials'}, status=401)

class CareerAssessmentView(APIView):
    def post(self, request):
        input_data = request.data.get('answers')
        if not input_data:
            return Response({'error': 'Answers are required'}, status=400)
        prompt = f"Suggest 3 careers based on these interests: {input_data}"
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            careers = response['choices'][0]['message']['content']
            return Response({'careers': careers})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class SkillSubmitView(APIView):
    def post(self, request):
        # Placeholder scoring logic
        weak_domains = ['SQL', 'Data Viz']
        courses = [
            {'title': 'SQL for Beginners - Coursera', 'url': 'https://coursera.org/example'}
        ]
        return Response({'weak_domains': weak_domains, 'courses': courses})

@api_view(['POST'])
def send_message(request):
    msg = GroupMessage.objects.create(
        group_id=request.data['group_id'],
        sender=request.user,
        content=request.data['content']
    )
    return Response({'status': 'sent'})

@api_view(['POST'])
def interview_prep(request):
    role = request.data['role']
    prompt = f"Give 5 mock interview questions for a {role} role."
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return Response({'questions': response['choices'][0]['message']['content']})
