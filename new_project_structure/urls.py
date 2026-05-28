"""
URL configuration for new_project_structure project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# naveen
from django.conf import settings
from django.contrib import admin
from django.urls import path
from new_app_structure.project_details.views import project, project_po_master_details

from new_app_structure.BOM_list_api.views import BOM_list
from new_app_structure.BOM_master.views import (
    BOM_master,
    all_vendors_components_view,
    price_view_new,
)
from new_app_structure.QC_answers.views import qc_answer_tables, qc_return_answer_tables
from new_app_structure.QC_componet_type.views import qc_component_type_view
from new_app_structure.QC_question_new.views import qc_tables
from new_app_structure.request_list_api.views import request_list, request_list_2
from new_app_structure.request_master_Api.views import request_master, request_master_id
from new_app_structure.Vendor_list.views import vendor_list
from new_app_structure.reserve.views import reserved_list, dereserve_item
from new_app_structure.vendor_master_api.views import get_choices, vendor_master
from new_app_structure.Inventory_api.views import inventory, inventory_details
from new_app_structure.request_projects.views import request_project_details
from new_app_structure.Component_master_api.coponent_view import component_view
from new_app_structure.cart.views import group_by_vendor

from new_app_structure.vendor_sub_list.views import vendor_sub_list
from new_app_structure.last_price.views import price_tables, request_master_with_price_view
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from new_app_structure.login.views import login_view

from new_app_structure.register.views import register_view, send_reset_link, reset_password
from new_app_structure.PO_list.views import PO_list
from new_app_structure.models import create_MRF, inventory_status, order_status
from new_app_structure.po_master.views import po_master_view
from new_app_structure.order_status.views import order_view
from new_app_structure.Inward.views import inward_view
from django.http import JsonResponse, HttpRequest
# from new_app_structure.QC.views import qc_tables
from new_app_structure.email.views import SendEmailView, file_upload_view

from new_app_structure.Notification.views import (
    approval_notification_send_email,
    inward_notification_send_email,
    new_submit_notification_send_email,
    notification_send_email,
)

from new_app_structure.Request_Po.views import update_request_status_from_po

# from new_app_structure.Tags.views import  get_list_of_tags, tags_view, test_search_list

from new_app_structure.Tags.views import tags_view, test_search_list, test_tag_list


# from rest_framework_swagger.views import get_swagger_view

from new_app_structure.Tags.meta.views import meta_view

from new_app_structure.Tags.meta.views import PostAJobListView_meta
from new_app_structure.Tags.create_tags.views import create_tags_view

from new_app_structure.Inventory_api.Inventory_Search.views import meta_search_list
from new_app_structure.Vendor_list.vendor_list_search.views import VendorSearchList

from new_app_structure.Damaged.views import damage_management
from new_app_structure.createMRF.views import create_MRF_table
from new_app_structure.createMRF_list.views import MRF_list_table
from new_app_structure.createMRFsublist.views import MRF_sub_list_table
from new_app_structure.inventory_status.views import inventory_status_view
# phase 2
from new_app_structure.request_component.views import request_component_view
from new_app_structure.request_component.views import component_options
from new_app_structure.request_component.views import request_component_detail_view
from new_app_structure.request_component.views import patch_vendor_added_by_component_id
from django.urls import include
from new_app_structure.vendor_product_image.views import upload_component_images,delete_component_image
from new_app_structure.po_delivery.views import po_delivery_view

from new_app_structure.outward.views import (
    outward_defects_view,
    outward_manufacture_view,
    outward_sales_view,
    outward_event_view,
    outward_sales_detail_view,
    outward_event_detail_view,
    outward_sales_items_view,
    outward_sales_item_detail_view,
    outward_event_items_view,
    outward_event_item_detail_view,

    outward_defects_detail_view,
    outward_manufacture_detail_view,
)


# from new_app_structure.ToolInventory.views import tool_inventory

from new_app_structure.ToolInventory.views import (
    tool_inventory,
    tool_inventory_detail,
    tool_inventory_entries,
    tool_inventory_entry_detail,
)


# this is the OTP generation configuration

# disable otp command this two lines
# from django_otp.admin import OTPAdminSite
# OTPAdminSite.disable_otp()

def root_view(request: HttpRequest):
    return JsonResponse({"where": "App1 root /"})


def api_root_view(request: HttpRequest):
    return JsonResponse({"where": "App1 /api/"})


def test_debug_view(request: HttpRequest):
    return JsonResponse({"ok": True, "from": "App1 /api/test-debug/"})



urlpatterns = [
    path("", root_view, name="root"),

    # http://127.0.0.1:8000/api/
    path("api/", api_root_view, name="api-root"),

    # http://127.0.0.1:8000/api/test-debug/
    path("api/test-debug/", test_debug_view, name="test-debug"),

    #path("", lambda r: JsonResponse({"where": "App1 root /"})),

    # /api/ root → so -i http://127.0.0.1:8000/api/ works
    #path("api/", lambda r: JsonResponse({"where": "App1 /api/"})),

    # /api/test-debug/ → your main debug URL
    #path("api/test-debug/", lambda r: JsonResponse({"ok": True, "from": "App1 /api/test-debug/"})),


    #testing
    #path("api/test-debug/", lambda r: JsonResponse({"ok": True})),
    # admin
    path("api/admin/", admin.site.urls),
    # bom_list
    path("api/bom_list/", BOM_list),
    path("api/bom_list/<str:bom_id>/", BOM_list),
    # bom_master
    path("api/bom_master/", BOM_master),
    path("api/bom_master/<str:id>/", BOM_master),
    # request_list
    path("api/bom_master/<str:id>/", BOM_master),
    # request_list
    path("api/request_list/", request_list),
    path("api/request_list/<str:request_id>/", request_list),
    # request_master
    path("api/request_list_2/", request_list_2),
    # Request_PO
    # path('update_request_po/<str:po_id>',update_request_status_from_po),
    path(
        "api/update_request_po/<str:po_id>/<str:request_id>", update_request_status_from_po
    ),
    path("api/update_request/", update_request_status_from_po),
    path("api/request_master/", request_master),
    path("api/request_master/<str:request_id>/", request_master),
    path("api/request_master/<str:request_id>/<int:id>/", request_master),
    # price table
    path("api/price_tables/", price_tables),
    # vendor list
    path("api/vendor_list/", vendor_list),
    path("api/vendor_list/<str:vendor_id>/", vendor_list),
    # vendor master
    path("api/vendor_master/", vendor_master),
    path("api/vendor_master/<str:product_id>/", vendor_master),
    # inventory
    path("api/inventory/", inventory),
    path("api/inventory/<str:serial_number>/", inventory),
    path("api/inventory/status/<str:status>/", inventory),
    path("api/component/", component_view),
    path("api/component/<str:component_id>/", component_view),

    path("api/cart/", group_by_vendor),
    path("api/cart/<int:id>/", group_by_vendor),
    path("api/vendor_sub_list/", vendor_sub_list),
    path("api/vendor_sub_list/<int:id>/", vendor_sub_list),
    path("api/vendor_sub_list_id/<str:vendor_id>/<int:id>/", vendor_sub_list),
    path("api/vendor_sub_list/", vendor_sub_list),
    path("api/price_tables/", price_tables),
    path("api/price_tables/<int:id>/", price_tables),
    path("api/login/", login_view, name="login"),
    path("api/api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # register
    path("api/register/", register_view, name="register"),
    path("api/register/<int:id>/", register_view, name="register"),
    # po_list
    path("api/po_list/", PO_list),
    path("api/po_list/<str:id>/", PO_list),
    # po_master
    path("api/po_master/<int:id>/", po_master_view),
    path("api/po_master/", po_master_view),
    # over_view
    path("api/order_view/", order_view),
    path("api/order_view/<int:id>/", order_view),
    # inward
    path("api/inward/", inward_view),
    path("api/inward/<str:inward_id>/", inward_view),
    # QC
    path("api/qc_question/", qc_tables),
    # qc_component_type
    path("api/qc_component_type/", qc_component_type_view),
    # qc_questions
    path("api/qc_answer/", qc_answer_tables),
    path("api/qc_answer/<int:id>/", qc_answer_tables),
    path("api/qc_return_answer/", qc_return_answer_tables),
    path("api/qc_return_answer/<int:id>/", qc_return_answer_tables),
    # get_dropdown_choices
    # path("get_dropdown_choices/", get_dropdown_choices, name="get_dropdown_choices"),
    # email
    path("api/send-email/", SendEmailView.as_view(), name="send-email"),
    path("api/file_upload_view/", file_upload_view),
    # bom_master
    path("api/bom_master_view/", all_vendors_components_view),
    path("api/price_view_2/", price_view_new),
    path("api/price_view_new/", request_master_with_price_view),
    # email-notification
    path("api/inward-notification/", notification_send_email, name="send_email"),
    path("api/project/", project),
    path("api/project/<str:project_id>/", project),
    # dropwdown selection from backend
    path("api/get_choices/", get_choices, name="get_dropdown_choices"),
    # tags
    path("api/tags/", tags_view),
    path("api/tags/<str:id>/", tags_view),
    # Tag_search
    path("api/tag_search/", test_search_list.as_view()),
    # tags with components
    path("api/test_tags/", test_tag_list.as_view()),
    # meta tag
    path("api/meta_tag_search/", PostAJobListView_meta.as_view()),
    path("api/meta_tag_search/<int:id>/", PostAJobListView_meta.as_view()),
    # meta tag_list
    path("api/meta_tag_list/", meta_search_list.as_view()),
    # tag_list
    # path('tags_list/',get_list_of_tags),
    path("api/meta_tags/", meta_view),
    path("api/meta_tags/<int:id>/", meta_view),
    # create new tag
    path("api/create_tag/<int:id>/", create_tags_view),
    path("api/create_tag/", create_tags_view),
    # vendor_list_search
    path("api/vendor_search/", VendorSearchList.as_view()),
    path("api/vendor_search/<int:id>/", VendorSearchList.as_view()),
    # notification_approval
    path("api/notification_approval/", approval_notification_send_email),
    path("api/new_submit_notification/", new_submit_notification_send_email),
    path("api/inward_send_email/", inward_notification_send_email),
    path(
        "api/projects_details/<str:project_id>/",
        project_po_master_details,
        name="project-po-details",
    ),
    path(
        "api/inventory_details/<str:serial_number>/",
        inventory_details,
        name="inventory-details",
    ),
    path("api/damaged/<str:serial_number>/", damage_management, name="damaged-items"),
    path("api/damaged/", damage_management, name="damaged-items"),
    path("api/reserved/", reserved_list, name="reserved-list"),
    path("api/dereserve/<str:serial_number>/", dereserve_item, name="dereserve-item"),
    path("api/create_MRF/", create_MRF_table, name="create_MRF"),
    path("api/create_MRF/<str:MRF_id>/", create_MRF_table, name="create_MRF"),
    path("api/MRFList/", MRF_list_table, name="MRF_List"),
    path("api/MRFList/<int:id>/", MRF_list_table, name="MRF_List"),
    path("api/request_inventory/", request_project_details, name="Request_Inventory"),
    path("api/inventory_status/", inventory_status_view),
    path("api/inventory_status/<str:serial_number>/", inventory_status_view),
    path("api/MRFSubList/", MRF_sub_list_table, name = "MRF_sub_list"),
    path("api/MRFSubList/<int:id>/", MRF_sub_list_table, name = "MRF_sub_list"),
    path('api/forgot-password/', send_reset_link),
    path('api/reset-password/', reset_password),

    path("api/request_component/", request_component_view, name="request_component"),
    path("api/request_component/<int:pk>/", request_component_detail_view),
    path("api/request_component/status/Added/<str:component_id>/", patch_vendor_added_by_component_id),
    path('api/component_options/', component_options),

    # path("component_images/", upload_component_images),
    # path("component_images/<str:component_id>/", upload_component_images),
    # path("component_images/<int:image_id>/", delete_component_image, name="delete_component_image"),


    path("api/component_images/", upload_component_images, name="upload_component_images"),
    path("api/component_images/by-component/<str:component_id>/", upload_component_images, name="upload_images_by_component"),
    path("api/component_images/<int:image_id>/", delete_component_image, name="delete_component_image"),
    path("api/po_delivery/", po_delivery_view),
    # path("po_delivery/<int:id>/", po_delivery_view),

    path("api/po_delivery/<int:pk>/", po_delivery_view),

    path("api/outward/defects/", outward_defects_view),
    path("api/outward/manufacture/", outward_manufacture_view),

    path("api/outward/sales/", outward_sales_view),
    path("api/outward/sales/<int:id>/", outward_sales_detail_view),
    path("api/outward/sales/<int:id>/items/", outward_sales_items_view),
    path("api/outward/sales/<int:id>/items/<int:item_id>/", outward_sales_item_detail_view),

    path("api/outward/event/", outward_event_view),
    path("api/outward/event/<int:id>/", outward_event_detail_view),
    path("api/outward/event/<int:id>/items/", outward_event_items_view),
    path("api/outward/event/<int:id>/items/<int:item_id>/", outward_event_item_detail_view),

    path("api/outward/defects/<int:id>/", outward_defects_detail_view),
    path("api/outward/manufacture/<int:id>/", outward_manufacture_detail_view),
    path('api/tool_inventory/', tool_inventory),        # GET all, POST new
    path("api/tool_inventory/<int:pk>/", tool_inventory_detail, name="tool_inventory_detail"), 
    path("api/tool_inventory_entries/", tool_inventory_entries),
    path("api/tool_inventory_entries/<int:pk>/", tool_inventory_entry_detail),



] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
