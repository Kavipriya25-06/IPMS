from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from new_app_structure.models import  RequestMaster, RequestToPO, cart, po_master
from new_app_structure.models import po_list
from rest_framework.response import Response

from rest_framework.response import Response
from rest_framework.decorators import api_view
from new_app_structure.models import RequestMaster, cart, po_list, po_master



# @api_view(['GET'])
# def update_request_status_from_po(request):
#     # Fetch all RequestMaster entries
#     requests = RequestMaster.objects.all()

#     result = []
#     for req in requests:
#         try:
#             # Get the cart entry linked to this RequestMaster
#             cart_entry = cart.objects.get(request_id=req)

#             # Get the po_list entry linked to this cart
#             po_entry = po_list.objects.get(cart_id=cart_entry)

#             # Get the po_master entry linked to this po_list
#             po_master_entry = po_master.objects.get(PO_id=po_entry)

#             # Add the details to the result
#             result.append({
#                 "request_id": req.id,
#                 "request_status": req.status,
#                 "po_id": po_master_entry.PO_id.id,
#                 "po_status": po_master_entry.status,
#             })
#         except (cart.DoesNotExist, po_list.DoesNotExist, po_master.DoesNotExist):
#             # Handle missing data gracefully
#             result.append({
#                 "request_id": req.id,
#                 "request_status": req.status,
#                 "po_id": None,
#                 "po_status": "Not Available"
#             })

#     return Response(result)

# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from new_app_structure.models import RequestMaster, cart, po_list, po_master

# @api_view(['GET'])
# def update_request_status_from_po(request):
#     # Initialize the result list
#     result = []

#     # Fetch all RequestMaster entries
#     requests = RequestMaster.objects.all()

#     # Iterate through each request
#     for req in requests:
#         # Get all cart entries linked to this request
#         cart_entries = po_master.objects.filter(request_id=req)

#         # Process each cart entry
#         for cart_entry in cart_entries:
#             # Fetch all po_list entries linked to the cart
#             po_entries = po_list.objects.filter(cart_id=cart_entry)

#             for po_entry in po_entries:
#                 # Fetch the po_master entry linked to this PO
#                 po_master_entry = po_list.objects.filter(PO_id=po_entry).first()

#                 # Append details to the result list
#                 result.append({
#                     "request_id": req.id,
#                     "request_status": req.status,
#                     "po_id": po_master_entry.PO_id.id if po_master_entry else po_entry.id,
#                     "po_status": po_master_entry.status if po_master_entry else "PO Master Entry Not Found",
#                 })

#     return Response(result)


# ############################################################################# testing ################################################

from rest_framework.decorators import api_view
from rest_framework.response import Response
from new_app_structure.models import RequestMaster, cart, po_list

@api_view(['GET'])
def update_request_status_from_po(request):
    """
    Matches RequestMaster IDs with po_master request IDs and displays details.
    """
    result = []

    # Fetch all RequestMaster entries
    requests = RequestMaster.objects.all()
    request_list_id = RequestMaster.objects.values_list('request_id', flat=True)
    print(request_list_id)

    for req in requests:
        # Filter po_master entries linked to this RequestMaster
        po_entries = po_master.objects.filter(cart_id__request_id=req)

        if po_entries.exists():
            for po in po_entries:
                # Append matching details to the result
                result.append({
                    "request_id": req.id,
                    "request_status": req.status,
                    "po_id": po.PO_id.id,
                    "po_status": po.status,
                    "request_list_id": req.request_id
                    
                })
        else:
            # If no matching PO entries found, append default details
            result.append({
                "request_id": req.id,
                "request_status": req.status,
                "po_id": None,
                "po_status": "Not Available",
                "request_list_id": req.request_id
            })

    return Response(result)
