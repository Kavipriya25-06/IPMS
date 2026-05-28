from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from new_app_structure.models import project_details
from rest_framework.response import Response
from new_app_structure.project_details.serializers import project_details_Serializer
from rest_framework import status
from new_app_structure.models import project_details, cart, RequestList, BOMList, BOMMaster, po_list, po_master, RequestMaster
from new_app_structure.project_details.serializers import project_details_Serializer, ProjectDetailsSerializer, RequestListSerializer, RequestMasterSerializer, BOMListSerializer, BOMMasterSerializer, POListSerializer, POMasterSerializer



@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def project(request, project_id=None):
    if request.method == 'GET':
        if project_id:
            # Fetch a specific PO by PO_id
            
            try:
                obj = project_details.objects.get(project_id=project_id)
                serializer = project_details_Serializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except project_details.DoesNotExist:
                return Response({"error": "PO not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Fetch all POs
            objs = project_details.objects.all()
            serializer = project_details_Serializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        serializer = project_details_Serializer(data=request.data)
        if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.data)
            
    elif request.method in ['PUT', 'PATCH']:
        if not project_id:
            return Response({"error": "ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        obj = get_object_or_404(project_details, project_id=project_id)
        partial = request.method == 'PATCH'
        serializer = project_details_Serializer(obj, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not project_id:
            return Response({"error": "ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        obj = get_object_or_404(project_details, project_id=project_id)
        obj.delete()
        return Response({"message": "Deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    



@api_view(['GET'])
def project_po_master_details(request, project_id):
    try:
        # Step 1: Fetch the project
        project = get_object_or_404(project_details, project_id=project_id)

        # Step 2: Fetch all RequestMaster entries for the given project
        requests = RequestMaster.objects.filter(project_id=project)

        # Step 3: Fetch all RequestList entries linked to these RequestMaster entries
        request_list_ids = requests.values_list("request", flat=True).distinct()
        request_lists = RequestList.objects.filter(request_id__in=request_list_ids)

        # Step 4: Fetch all BOMList entries linked to these RequestList entries
        bom_list_ids = request_lists.values_list("bom", flat=True).distinct()
        bom_lists = BOMList.objects.filter(bom_id__in=bom_list_ids)

        # Step 5: Fetch all BOMMaster entries linked to these BOMList entries
        # bom_master_entries = BOMMaster.objects.filter(bom__in=bom_lists)

        # Step 6: Fetch all carts linked to these requests
        carts = cart.objects.filter(request_id__in=requests)

        # Step 7: Fetch all PO Master entries linked to these carts
        po_master_entries = po_master.objects.filter(cart_id__in=carts)

        # Step 8: Serialize the data
        requests_serialized = RequestMasterSerializer(requests, many=True).data
        request_lists_serialized = RequestListSerializer(request_lists, many=True).data
        bom_lists_serialized = BOMListSerializer(bom_lists, many=True).data
        # bom_master_serialized = BOMMasterSerializer(bom_master_entries, many=True).data
        po_master_serialized = POMasterSerializer(po_master_entries, many=True).data

        return Response({
            "project": {
                "project_id": project.project_id,
                "project_name": project.project_name,
                "description": project.description,
                "start_date": project.start_date,
                "project_type":project.project_type
            },
            "requests": requests_serialized,  # Request Master
            "request_lists": request_lists_serialized,  # Request List
            "bom_lists": bom_lists_serialized,  # BOM List
            # "bom_master": bom_master_serialized,  # BOM Master
            "po_master": po_master_serialized,  # PO Master
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

