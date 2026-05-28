from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from new_app_structure.models import Inventory, Reserved
from new_app_structure.reserve.serializer import ReservedSerializer


# @api_view(['GET'])
# def reserved_list(request):
#     """
#     List all reserved inventory items with full Inventory details.
#     """
#     reserved_items = Reserved.objects.select_related('serial_number').all()  # Optimized query with JOIN
#     serializer = ReservedSerializer(reserved_items, many=True)
#     return Response(serializer.data)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from new_app_structure.models import Reserved,RequestMaster
from new_app_structure.reserve.serializer import ReservedSerializer

@api_view(['GET','POST'])
def reserved_list(request):
    """
    API to list all reserved inventory items with full Inventory details, 
    including the associated Request ID.
    """
    
    def get_request_id_by_serial_number(serial_number):
        try:
            # Step 1: Fetch the Reserved Entry
            reserved_entry = Reserved.objects.get(serial_number__serial_number=serial_number)

            # Step 2: Get the related Inventory Entry
            inventory_entry = reserved_entry.serial_number  # This is an Inventory object

            # Step 3: Find the Related RequestMaster Entry
            request_master_entry = RequestMaster.objects.filter(component__component_id=inventory_entry.component_id).first()

            # Step 4: Extract Request ID from RequestList
            if request_master_entry:
                return request_master_entry.request.request_id  # Fetch request_id
            else:
                return None  # No matching RequestMaster found
            
        except Reserved.DoesNotExist:
            return None 

    # Fetch all reserved inventory items
    reserved_items = Reserved.objects.select_related('serial_number').all()  # Optimized query with JOIN
    
    # Serialize data
    serializer = ReservedSerializer(reserved_items, many=True)

    # Add request_id for each reserved item
    data_with_request_id = []
    for item in serializer.data:
        serial_number = item.get('serial_number', None)  # Extract serial_number
        request_id = get_request_id_by_serial_number(serial_number)  # Get the corresponding request_id
        
        # Append request_id to the response
        item['request_id'] = request_id  
        data_with_request_id.append(item)

    return Response(data_with_request_id)





@api_view(['PUT'])
def dereserve_item(request, serial_number):
    """
    Updates the inventory status to 'available' and removes the reserved entry.
    """
    try:
        # Fetch the inventory item with the given serial number
        inventory_item = Inventory.objects.get(serial_number=serial_number)

        # Check if the item is currently reserved
        if inventory_item.status != "Reserved":
            return Response({"error": "Item is not Reserved"}, status=status.HTTP_400_BAD_REQUEST)

        # Update status to 'available'
        inventory_item.status = "available"
        inventory_item.save()

        # Remove the reserved entry
        Reserved.objects.filter(serial_number=inventory_item).delete()

        return Response({"message": "Item dereserved successfully"}, status=status.HTTP_200_OK)

    except Inventory.DoesNotExist:
        return Response({"error": "Inventory item not found"}, status=status.HTTP_404_NOT_FOUND)
