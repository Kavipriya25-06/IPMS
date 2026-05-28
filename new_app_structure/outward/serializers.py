# new_app_structure/outward/serializers.py
from rest_framework import serializers

# If SalesItem/EventItem live in new_app_structure/models.py use this:
from new_app_structure.models import Outward, SalesItem, EventItem

# If instead you put them in new_app_structure/outward/models.py, swap the above for:
# from new_app_structure.models import Outward
# from new_app_structure.outward.models import SalesItem, EventItem


# ---------- helpers ----------
def csv_to_list(s: str):
    return [x.strip() for x in s.split(",")] if s else []

def list_to_csv(lst):
    return ",".join([str(x).strip() for x in lst]) if lst else ""


# ---------- child item serializers ----------
class SalesItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesItem
        fields = ["id", "component", "serial_number", "quantity", "remarks"]


class EventItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventItem
        fields = ["id", "component", "serial_number", "quantity", "remarks"]


# ---------- base outward (CSV <-> list for serial_numbers, attachments) ----------
class OutwardBaseSerializer(serializers.ModelSerializer):
    serial_numbers = serializers.ListField(child=serializers.CharField(), required=False)
    attachments = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = Outward
        fields = "__all__"

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["serial_numbers"] = csv_to_list(getattr(instance, "serial_numbers", None))
        rep["attachments"] = csv_to_list(getattr(instance, "attachments", None))
        return rep

    def create(self, validated_data):
        serial_numbers = validated_data.pop("serial_numbers", [])
        attachments = validated_data.pop("attachments", [])
        validated_data["serial_numbers"] = list_to_csv(serial_numbers)
        validated_data["attachments"] = list_to_csv(attachments)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "serial_numbers" in validated_data:
            instance.serial_numbers = list_to_csv(validated_data.pop("serial_numbers"))
        if "attachments" in validated_data:
            instance.attachments = list_to_csv(validated_data.pop("attachments"))
        return super().update(instance, validated_data)


# ---------- Defects ----------
# Fields: id, date, time, invoice_no, vendor, specification, quantity, project, type_of_outward, remarks
class DefectsOutwardSerializer(OutwardBaseSerializer):
    class Meta(OutwardBaseSerializer.Meta):
        fields = [
            "id", "category", "date", "time",
            "invoice_no", "vendor", "specification", "quantity",
            "project", "type_of_outward", "remarks",
        ]

    def create(self, validated_data):
        validated_data["category"] = "Defects"
        return super().create(validated_data)


# ---------- Manufacture ----------
# Fields: id, date, time, gatepass, specification, component_id, serial_numbers(list),
#         vendor, quantity, project, type_of_outward, remarks, attachments(list)
class ManufactureOutwardSerializer(OutwardBaseSerializer):
    class Meta(OutwardBaseSerializer.Meta):
        fields = [
            "id", "category", "date", "time",
            "gatepass", "specification", "component_id", "serial_numbers",
            "vendor", "quantity", "project", "type_of_outward",
            "remarks", "attachments","return_date",
        ]

        read_only_fields = ["gatepass", "category", "date", "time"]

    def create(self, validated_data):
        validated_data["category"] = "Manufacture"
        return super().create(validated_data)


# ---------- Sales ----------
# Fields: id, date, time, invoice_no, product_name, client, list_of_deliverables,
#         type_of_outward, remarks, sales_items(nested)
class SalesOutwardSerializer(OutwardBaseSerializer):
    # ADD THIS: nested list of children
    sales_items = SalesItemSerializer(many=True, required=False)

    class Meta(OutwardBaseSerializer.Meta):
        fields = [
            "id", "category", "date", "time",
            "gatepass",                    # auto-generated in model for Sales/Event
            "invoice_no", "product_name", "client", "list_of_deliverables",
            "type_of_outward", "remarks",
            "sales_items",                # <— include nested
        ]
        read_only_fields = ["gatepass", "category", "date", "time"]

    def create(self, validated_data):
        items = validated_data.pop("sales_items", [])
        validated_data["category"] = "Sales"
        outward = super().create(validated_data)
        for it in items:
            SalesItem.objects.create(outward=outward, **it)
        return outward

    def update(self, instance, validated_data):
        items = validated_data.pop("sales_items", None)
        outward = super().update(instance, validated_data)
        # If client sends sales_items, REPLACE the list (same behavior as Event)
        if items is not None:
            outward.sales_items.all().delete()
            for it in items:
                SalesItem.objects.create(outward=outward, **it)
        return outward


# ---------- Event ----------
# Fields: id, date, time, gatepass, event_name, num_components, type_of_outward,
#         return_date, remarks, event_items(nested)
class EventOutwardSerializer(OutwardBaseSerializer):
    # keep your nested items if you use them
    event_items = EventItemSerializer(many=True, required=False)

    class Meta(OutwardBaseSerializer.Meta):
        fields = [
            "id", "category", "date", "time",
            "gatepass", "event_name", "num_components",
            "type_of_outward", "return_date", "remarks",
            "event_items",
        ]
        read_only_fields = ["gatepass", "category", "date", "time"]

    def create(self, validated_data):
        items = validated_data.pop("event_items", [])
        validated_data["category"] = "Event"
        outward = super().create(validated_data)  # gatepass is auto-set in model.save()
        for it in items:
            EventItem.objects.create(outward=outward, **it)
        return outward

    def update(self, instance, validated_data):
        items = validated_data.pop("event_items", None)
        outward = super().update(instance, validated_data)
        if items is not None:
            outward.event_items.all().delete()
            for it in items:
                EventItem.objects.create(outward=outward, **it)
        return outward
