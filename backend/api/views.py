from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import GroupMessage
from .serializers import RegisterSerializer
import openai

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

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        group_id = request.data.get('group_id')
        content = request.data.get('content')
        if not group_id or not content:
            return Response({'error': 'Group ID and content are required'}, status=400)
        try:
            msg = GroupMessage.objects.create(
                group_id=group_id,
                sender=request.user,
                content=content
            )
            return Response({'status': 'sent'})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class InterviewPrepView(APIView):
    def post(self, request):
        role = request.data.get('role')
        if not role:
            return Response({'error': 'Role is required'}, status=400)
        prompt = f"Give 5 mock interview questions for a {role} role."
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            questions = response['choices'][0]['message']['content']
            return Response({'questions': questions})
        except Exception as e:
            return Response({'error': str(e)}, status=500)
