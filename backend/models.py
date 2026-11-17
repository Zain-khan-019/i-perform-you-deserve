from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, default="")
    role = Column(String, default="customer")  # customer | vendor
    created_at = Column(DateTime, default=datetime.utcnow)


class OtpCode(Base):
    __tablename__ = "otp_codes"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)


class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    business_name = Column(String, nullable=False)
    category = Column(String, index=True, nullable=False)  # hostel | food | laundry | commute | pest
    area = Column(String, index=True, nullable=False)
    address = Column(String, default="")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    price = Column(Float, nullable=False)  # PKR per month
    seater = Column(String, default="")    # single | bi | tri (hostels)
    has_wifi = Column(Boolean, default=False)
    has_backup = Column(Boolean, default=False)  # generator / UPS
    description = Column(Text, default="")
    rating = Column(Float, default=4.0)
    is_verified = Column(Boolean, default=False)


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    status = Column(String, default="pending")  # pending | confirmed | cancelled
    created_at = Column(DateTime, default=datetime.utcnow)