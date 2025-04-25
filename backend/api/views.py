from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import *
from .serializers import RegisterSerializer
import openai

@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})
    return Response(serializer.errors)

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})
    return Response({'error': 'Invalid credentials'})

@api_view(['POST'])
def career_assessment(request):
    input_data = request.data['answers']
    prompt = f"Suggest 3 careers based on these interests: {input_data}"
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    careers = response['choices'][0]['message']['content']
    return Response({'careers': careers})

@api_view(['POST'])
def skill_submit(request):
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
