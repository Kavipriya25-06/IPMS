from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from new_app_structure.models import RequestMaster
from new_app_structure.request_projects.serializers import RequestProjectSerializer


@api_view(["GET"])
def request_project_details(request):
    """
    API Endpoint:
    - GET `/request_inventory/`
    - Returns a list of all Request IDs, their associated Project IDs, and Project Details.
    """
    request_projects = RequestMaster.objects.select_related("project_id").all()
    serializer = RequestProjectSerializer(request_projects, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)
