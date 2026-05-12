from rest_framework import serializers

class ImageUploadSerializer(serializers.Serializer):
    image = serializers.ListField(
        child=serializers.ImageField()
    )
    event_id = serializers.CharField()
    uploaded_by = serializers.CharField()