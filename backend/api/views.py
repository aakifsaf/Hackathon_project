from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .models import CareerAssessmentQuestion, CareerAssessmentAnswer, CareerRoadmap
from .serializers import RegisterSerializer, ProfileSerializer, CareerRoadmapSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
import requests
import json
from django.conf import settings
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import logging
from transformers import AutoTokenizer, pipeline
import ast
import re
from openai import OpenAI
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()  # Save the new user
            
            refresh = RefreshToken.for_user(user)  # Create a refresh token
            access_token = str(refresh.access_token)  # Create an access token

            return Response(
                {'access_token': access_token, 'refresh_token': str(refresh)},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password') 
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)  # Create a refresh token
            access_token = str(refresh.access_token)  # Create an access token

            return Response(
                {'access_token': access_token, 'refresh_token': str(refresh)},
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

logger = logging.getLogger(__name__)
class CareerAssessmentView(APIView):
    permission_classes = [IsAuthenticated] # Ensure user is authenticated

    def post(self, request):
        # Check if the user already has questions and delete them
        # This ensures a user only has one set of active questions from the latest assessment initiation
        CareerAssessmentQuestion.objects.filter(user=request.user).delete()

        skills = request.data.get('skills')
        interests = request.data.get('interests')
        career_goals = request.data.get('career_goals')

        if not skills or not interests or not career_goals:
            return Response(
                {'error': 'Skills, interests, and career goals are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        prompt = (
            f"You are an AI career counselor. Based on the following beginner-level user information, "
            f"generate exactly 5 open-ended career assessment questions:\n\n"
            f"Skills: {skills}\n"
            f"Interests: {interests}\n"
            f"Career Goals: {career_goals}\n\n"
            f"Only return the questions in a numbered list format (1-5), with no extra text, no introductions, and no conclusions."
        )

        try:
            client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=settings.OPENROUTER_API_KEY,
            )

            completion = client.chat.completions.create(
                model="deepseek/deepseek-chat-v3-0324:free", # Consider updating model if needed
                messages=[
                    {"role": "user", "content": prompt}
                ],
                extra_headers={
                    "HTTP-Referer": getattr(settings, 'OPENROUTER_REFERRER', ''),
                    "X-Title": getattr(settings, 'OPENROUTER_TITLE', ''),
                },
                extra_body={}
            )
            if not completion or not completion.choices:
                logger.error(f"OpenRouter API returned invalid response for user {request.user.id}: {completion}")
                return Response({'error': 'AI service did not return valid choices. Please try again.'},
                                status=status.HTTP_502_BAD_GATEWAY)

            content = completion.choices[0].message.content

            # Clean and parse content
            txt = re.sub(r'\\boxed\{|\}|\{', '', content)
            try:
                items = ast.literal_eval(txt) # This can be risky if txt is not a valid Python literal string
            except (ValueError, SyntaxError):
                # Fallback parsing for simple numbered lists if literal_eval fails
                items = [line.strip() for line in txt.splitlines() if line.strip()] 

            clean_qs = []
            for q_text in items:
                # Enhanced cleaning: remove leading numbers/bullets, asterisks, and strip whitespace/quotes
                q_text = re.sub(r'^\s*[\d\.\*\-\s]+\s*', '', str(q_text))
                q_text = q_text.replace('**', '').strip(' ,"\n')
                if q_text:
                    clean_qs.append(q_text)
            
            if not clean_qs:
                 logger.error(f"Could not parse any questions from AI response for user {request.user.id}. Raw content: {repr(content)}")
                 return Response({'error': 'Failed to parse questions from AI service.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Save only up to 5 cleaned questions for the authenticated user
            saved_questions_text = []
            for question_text in clean_qs[:5]:
                CareerAssessmentQuestion.objects.create(user=request.user, question=question_text)
                saved_questions_text.append(question_text)

            return Response({'generated_questions': saved_questions_text}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error generating/saving questions for user {request.user.id}", exc_info=e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CareerGuidanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Get the most recent roadmap entry for the authenticated user
        latest_roadmap = CareerRoadmap.objects.filter(user=request.user).order_by('-created_at').first()

        if not latest_roadmap:
            return Response({'message': 'No career roadmap found for your profile.'}, status=status.HTTP_204_NO_CONTENT)

        # Prepare the response with available data
        data = {
            'roadmap': latest_roadmap.roadmap,
            'skills': latest_roadmap.skills,
            'certifications': latest_roadmap.certifications,
            'user_responses': latest_roadmap.user_responses, # Optionally include the responses it was based on
            'created_at': latest_roadmap.created_at
        }

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        answers = request.data.get('answers') # Frontend will need to send answers in a dictionary format
        # Example: {"Question 1 text": "User answer 1", "Question 2 text": "User answer 2", ...}
        # Or, if answers are just a list of strings: request.data.get('answer_list')
        # And then adapt how answer_text is formed in generate_personalized_roadmap.

        if not answers or not isinstance(answers, dict): # Adjust if answer format changes
            return Response(
                {'error': 'Answers are required and must be a dictionary of question-answer pairs.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        logger.debug(f"Received answers for roadmap generation from user {request.user.id}: {answers}")

        try:
            # Generate the CareerRoadmap instance, passing the user
            roadmap_instance = self.generate_personalized_roadmap(answers, request.user)
            
            if not roadmap_instance:
                return Response({'error': 'Failed to generate career roadmap.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            serializer = CareerRoadmapSerializer(roadmap_instance) # Use the instance here
            return Response({'roadmap': serializer.data}, status=status.HTTP_201_CREATED) # 201 for new resource
        except Exception as e:
            logger.error(f"Error in roadmap generation endpoint for user {request.user.id}", exc_info=True)
            return Response({'error': f"An unexpected error occurred during roadmap generation: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def generate_personalized_roadmap(self, answers, user): # Added user parameter
        try:
            # Prepare the user's responses
            answer_text = "\n".join([f"{k}: {v}" for k, v in answers.items()])

            # Prepare the prompt to send to the OpenRouter API
            prompt = (
                "You are an expert career guidance AI mentor. "
                "Based on the user's responses below, generate a detailed output containing:\n"
                "1. A personalized 5-step career roadmap.\n"
                "2. A list of essential skills to learn.\n"
                "3. A list of relevant and recognized certifications to pursue.\n"
                "Ensure the roadmap is practical, clearly structured, and tailored to the user's interests, skills, and goals. "
                "Include actionable steps, project suggestions, and career advice for each phase.\n\n"
                "User's responses:\n"
                f"{answer_text}\n\n"
                "Your response should be structured as follows:\n"
                "* Career Roadmap: (list and explain 5 clear steps)\n"
                "* Required Skills: (bullet list of skills to learn)\n"
                "* Recommended Certifications: (bullet list of certifications with brief descriptions with links for courses or certifications)\n\n"
                "Begin now"
            )

            # Prepare the headers and data for the API request
            headers = {
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            }

            data = {
                "model": "mistralai/mistral-7b-instruct:free",
                "messages": [{"role": "user", "content": prompt}],
            }

            # Make the API request to OpenRouter
            response = requests.post("https://openrouter.ai/api/v1/chat/completions", json=data, headers=headers)
            result = response.json()
            print(f"OpenRouter API response: {result}")

            # Extract the generated content from the response
            roadmap_content = result['choices'][0]['message']['content']
            logger.info(f"Raw AI roadmap content to parse for user {user.id}:\n{roadmap_content}") # Log raw content

            # Parse the roadmap, skills, and certifications from the AI response
            roadmap, skills, certifications = self.parse_roadmap_content(roadmap_content)

            # Delete old roadmap for the user, if any, to ensure only one active roadmap
            CareerRoadmap.objects.filter(user=user).delete()

            # Save the generated content to the database, associated with the user
            roadmap_instance = CareerRoadmap.objects.create(
                user=user,  # Associate with the logged-in user
                user_responses=answer_text, # Reverted to storing formatted string
                roadmap=roadmap,
                skills=skills,
                certifications=certifications,
            )

            return roadmap_instance

        except Exception as e:
            logger.error(f"Error in generate_personalized_roadmap for user {user.id if user else 'Unknown'}: {str(e)}", exc_info=True)
            return None

    def parse_roadmap_content(self, content):
        roadmap = ""
        skills = ""
        certifications = ""
        
        # Standardize newlines to simplify splitting and searching
        content = content.replace('\r\n', '\n').strip()

        try:
            # Define the key phrases that mark the beginning of each section (case-insensitive)
            # The AI response uses these as part of a heading, often bolded.
            # We will search for these phrases, then take the content following that line.
            roadmap_marker = "Career Roadmap"
            skills_marker = "Required Skills"
            certs_marker = "Recommended Certifications"

            lines = content.split('\n')
            
            current_section = None
            roadmap_lines = []
            skills_lines = []
            certs_lines = []

            for i, line in enumerate(lines):
                line_lower = line.lower()
                if roadmap_marker.lower() in line_lower and ":" in line_lower: # Check for colon too, as it seems to be part of header
                    current_section = "roadmap"
                    # Content for roadmap starts from the *next* line if this line is just the header
                    # Or if the header is like "**Career Roadmap:** Blah...", then this line has content too.
                    # For simplicity, let's assume content starts on the next line or after the first colon.
                    # If the marker is part of a longer title line, we might want the rest of that line too.
                    # This part needs to be robust to how the AI formats its header line.
                    # Let's try taking everything after the first line that contains the marker
                    continue # Skip the header line itself from being added to content lines
                elif skills_marker.lower() in line_lower and ":" in line_lower:
                    current_section = "skills"
                    continue
                elif certs_marker.lower() in line_lower and ":" in line_lower:
                    current_section = "certs"
                    continue
                
                if current_section == "roadmap":
                    # Avoid picking up the next section's header as part of current section's content
                    if not (skills_marker.lower() in line_lower and ":" in line_lower) and \
                       not (certs_marker.lower() in line_lower and ":" in line_lower):
                        roadmap_lines.append(line)
                elif current_section == "skills":
                    if not (certs_marker.lower() in line_lower and ":" in line_lower):
                        skills_lines.append(line)
                elif current_section == "certs":
                    certs_lines.append(line)
            
            roadmap = "\n".join(roadmap_lines).strip()
            skills = "\n".join(skills_lines).strip()
            certifications = "\n".join(certs_lines).strip()

            # Basic check: If all are empty but original content was not, parsing likely failed.
            if not roadmap and not skills and not certifications and content:
                logger.warning(f"Parsing might have failed. Markers not found or structure mismatch. Review AI output. Content (start): {content[:300]}...")
            else:
                logger.info(f"Parsed Roadmap (first 100 chars): {roadmap[:100]}...")
                logger.info(f"Parsed Skills (first 100 chars): {skills[:100]}...")
                logger.info(f"Parsed Certifications (first 100 chars): {certifications[:100]}...")

        except Exception as e:
            logger.error(f"Error during parse_roadmap_content: {str(e)}\nProblematic Content (first 300 chars):\n{content[:300]}...", exc_info=True)
            return "", "", "" # Ensure returning tuple in case of error
            
        return roadmap, skills, certifications
        
        
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            serializer = ProfileSerializer(request.user)
            if not serializer:
                return Response({'error': 'User profile does not exist'}, status=status.HTTP_404_NOT_FOUND)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.conf import settings

class ChatBotView(APIView):
    # permission_classes = [IsAuthenticated] # Removed for guest access
    def post(self, request):
        user_input = request.data.get('question')
        user = request.user
        if not user_input:
            return Response({'error': 'Question is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Use API key from settings
        api_key = settings.OPENROUTER_API_KEY
        if not api_key:
            return Response({'error': 'API key not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Prepare the payload for DeepSeek model
        payload = {
            "model": "deepseek/deepseek-chat-v3-0324:free",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_input}
            ],
            "stream": False
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        try:
            response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            reply = result["choices"][0]["message"]["content"]
            return Response({'answer': reply}, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CareerAssessmentQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch the latest 5 questions for the authenticated user
        user_questions = CareerAssessmentQuestion.objects.filter(user=request.user).order_by('-created_at')[:5]

        if not user_questions:
            # It's important to let the frontend know if no questions are ready.
            # This could mean the user hasn't completed the step that generates questions,
            # or an issue occurred during generation.
            return Response(
                {'message': 'No assessment questions found for your profile. Please complete the initial assessment steps.'},
                status=status.HTTP_204_NO_CONTENT # Or HTTP_404_NOT_FOUND, depending on frontend handling
            )

        # Serialize the questions
        # The frontend expects a list of {'id': q.id, 'question': text}
        serialized_questions = [
            {'id': q.id, 'question': q.question.strip()} for q in user_questions
        ]

        return Response({'questions': serialized_questions}, status=status.HTTP_200_OK)

class CareerAssessmentAnswersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        answers = CareerAssessmentAnswer.objects.filter(user=user).order_by('id')

        if not answers:
            return Response({'error': 'No answers found for this user.'}, status=status.HTTP_404_NOT_FOUND)

        response_data = [{'question_id': answer.question.id, 'answer': answer.answer} for answer in answers]
        return Response({'answers': response_data}, status=status.HTTP_200_OK)

    def post(self, request):
        answers = request.data.get('answers', [])
        user = request.user

        if not isinstance(answers, list) or not answers:
            return Response({'error': 'Answers must be a non-empty list.'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the latest 5 questions for the authenticated user, consistent with what was displayed
        questions = CareerAssessmentQuestion.objects.filter(user=request.user).order_by('-created_at')[:5]

        if len(answers) != questions.count():
            return Response(
                {'error': f'Expected {questions.count()} answers, but got {len(answers)}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        for question, answer_text in zip(questions, answers):
            CareerAssessmentAnswer.objects.create(
                question=question,
                user=user,
                answer=answer_text
            )

        return Response({'message': 'Answers saved successfully.'}, status=status.HTTP_201_CREATED)