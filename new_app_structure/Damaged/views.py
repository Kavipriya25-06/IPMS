from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from new_app_structure.models import Inventory, DamagedInventory
from new_app_structure.Damaged.serializers import DamagedInventorySerializer

@api_view(['POST', 'GET', 'PUT', 'PATCH', 'DELETE'])
def damage_management(request, serial_number=None):
    """
    Handles damage reporting, retrieving, updating, and deleting damaged inventory items.
    """

    # **GET: Retrieve All or Specific Damaged Items**
    if request.method == 'GET':
        if serial_number:
            damaged_item = get_object_or_404(DamagedInventory, serial_number__serial_number=serial_number)
            serializer = DamagedInventorySerializer(damaged_item)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            damaged_items = DamagedInventory.objects.all()
            serializer = DamagedInventorySerializer(damaged_items, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    # **POST: Report a New Damaged Item**
    if request.method == 'POST':
        try:
            serial_number = request.data.get("serial_number")
            if not serial_number:
                return Response({"error": "Serial number is required"}, status=status.HTTP_400_BAD_REQUEST)
            inventory_item = get_object_or_404(Inventory, serial_number=serial_number)

            # Check if the item is already reported as damaged
            if DamagedInventory.objects.filter(serial_number=inventory_item).exists():
                return Response({"error": "Item is already reported as damaged"}, status=status.HTTP_400_BAD_REQUEST)

            # Create a damage report
            damage_data = {
                "serial_number": inventory_item.serial_number,
                "component_category": inventory_item.category,
                "component_type": inventory_item.component_type,
                "component_specification": inventory_item.specification,
                "status": request.data.get("status","") ,
                "remarks": request.data.get("remarks", ""),
                "reported_by": request.data.get("reported_by", "Unknown"),
            }
            
            serializer = DamagedInventorySerializer(data=damage_data)
            if serializer.is_valid():
                serializer.save(serial_number=inventory_item)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # **PATCH / PUT: Update Damage Status**
    if request.method in ['PATCH', 'PUT']:
        try:
            if not serial_number:
                return Response({"error": "Serial number is required"}, status=status.HTTP_400_BAD_REQUEST)

            damaged_item = get_object_or_404(DamagedInventory, serial_number__serial_number=serial_number)

            serializer = DamagedInventorySerializer(damaged_item, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # **DELETE: Remove a Damage Record**
    if request.method == 'DELETE':
        try:
            if not serial_number:
                return Response({"error": "Serial number is required"}, status=status.HTTP_400_BAD_REQUEST)

            damaged_item = get_object_or_404(DamagedInventory, serial_number__serial_number=serial_number)
            damaged_item.delete()
            return Response({"message": "Damage record deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
