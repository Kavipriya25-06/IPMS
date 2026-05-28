from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from new_app_structure.models import Inventory
from new_app_structure.Inventory_api.serializers import inventory_serializer


from django.shortcuts import get_object_or_404

from new_app_structure.models import (
    Inventory,
    project_details,
    RequestMaster,
    RequestList,
    BOMList,
    po_master,
    cart,
    Inward,
)
from new_app_structure.Inventory_api.serializers import (
    inventory_serializer,
    ProjectDetailsSerializer,
    RequestListSerializer,
    RequestMasterSerializer,
    BOMListSerializer,
    POMasterSerializer,
    cart_serializer,
)

@api_view(["GET", "POST", "PUT", "PATCH", "DELETE"])
def inventory(request, serial_number=None):
    try:
        if serial_number:
            obj = Inventory.objects.get(serial_number=serial_number)
        else:
            obj = None
    except Inventory.DoesNotExist:
        return Response(
            {"error": "serial_number not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        if serial_number:
            serializer = inventory_serializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Filter by status query param
        status_filter = request.query_params.get("status", "").strip()
        if status_filter:
            inventory_items = Inventory.objects.filter(status__iexact=status_filter)
        else:
            inventory_items = Inventory.objects.all()

        serializer = inventory_serializer(inventory_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == "POST":
        serializer = inventory_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method in ["PUT", "PATCH"]:
        partial = request.method == "PATCH"
        serializer = inventory_serializer(obj, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        obj.delete()
        return Response(
            {"message": "deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )



@api_view(["GET"])
def inventory_details(request, serial_number):
    try:
        # Step 1: Fetch Inventory Item
        inventory_item = get_object_or_404(Inventory, serial_number=serial_number)

        # Step 2: Fetch all Inward Entries linked to this serial number
        inward_entries = Inward.objects.filter(serial_number=serial_number)
        if not inward_entries.exists():
            return Response(
                {"error": "No inward entries found for this serial number"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Step 3: Fetch all PO Master entries linked to these Inward Entries
        po_master_entries = po_master.objects.filter(
            PO_id__in=[inward.po_master_id.PO_id for inward in inward_entries]
        )

        # Step 4: Fetch all Cart entries linked to these PO Masters
        cart_entries = cart.objects.filter(
            id__in=po_master_entries.values_list("cart_id", flat=True)
        )

        # Step 5: Fetch all RequestMaster entries linked to these Carts
        request_master_entries = RequestMaster.objects.filter(
            id__in=cart_entries.values_list("request_id", flat=True)
        )

        # Step 6: Fetch all RequestList entries linked to these RequestMasters
        request_list_entries = RequestList.objects.filter(
            request_id__in=request_master_entries.values_list("request", flat=True)
        )

        # Step 7: Fetch all BOMList entries linked to these RequestLists
        bom_list_entries = BOMList.objects.filter(
            bom_id__in=request_list_entries.values_list("bom", flat=True)
        )

        # Step 8: Fetch all Project Details linked to these RequestMasters
        project_entries = project_details.objects.filter(
            project_id__in=request_master_entries.values_list("project_id", flat=True)
        )

        # Step 9: Serialize fetched data
        po_master_serialized = POMasterSerializer(po_master_entries, many=True).data
        cart_serialized = cart_serializer(cart_entries, many=True).data
        request_master_serialized = RequestMasterSerializer(
            request_master_entries, many=True
        ).data
        request_list_serialized = RequestListSerializer(
            request_list_entries, many=True
        ).data
        bom_list_serialized = BOMListSerializer(bom_list_entries, many=True).data
        project_serialized = ProjectDetailsSerializer(project_entries, many=True).data
        inventory_serialized = inventory_serializer(inventory_item).data

        return Response(
            {
                "inventory_item": inventory_serialized,
                "po_master": po_master_serialized,
                "cart": cart_serialized,
                "request_master": request_master_serialized,
                "request_list": request_list_serialized,
                "bom_list": bom_list_serialized,
                "project": project_serialized,
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
