from rest_framework import serializers
from new_app_structure.models import RequestMaster, project_details


class ProjectDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = project_details
        fields = "__all__"


class RequestProjectSerializer(serializers.ModelSerializer):
    project_details = ProjectDetailsSerializer(source="project_id", read_only=True)

    class Meta:
        model = RequestMaster
        fields = ["request_id", "project_id", "project_details"]
