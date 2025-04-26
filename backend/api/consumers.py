from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import async_to_sync
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import WebSocketMessage

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'chat'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))

# Signal to broadcast messages created in the database
@receiver(post_save, sender=WebSocketMessage)
def broadcast_message(sender, instance, created, **kwargs):
    if created:
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'chat',
            {
                'type': 'chat_message',
                'message': f"{instance.sender}: {instance.message}",
            }
        )
