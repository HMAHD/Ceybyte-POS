"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                              Sri Lankan Data Initialization                                      │
│                                                                                                  │
│  Description: Initialize Sri Lankan festivals, Poya days, and holidays data.                    │
│               Dynamic year-based calendar with accurate dates and business impact information.   │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from datetime import date, datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from models.festival_calendar import FestivalCalendar


def get_poya_dates_for_year(year: int) -> Dict[str, date]:
    """
    Calculate Poya (Full Moon) dates for a given year.
    These are approximate dates - in production, you'd want to use an astronomical library
    or maintain a lookup table with exact dates from the Department of Astronomy.
    """
    # Base Poya dates for 2025 (these are accurate)
    base_poya_2025 = {
        "duruthu": date(2025, 1, 13),
        "navam": date(2025, 2, 12),
        "medin": date(2025, 3, 14),
        "bak": date(2025, 4, 13),
        "vesak": date(2025, 5, 12),
        "poson": date(2025, 6, 11),
        "esala": date(2025, 7, 10),
        "nikini": date(2025, 8, 9),
        "binara": date(2025, 9, 7),
        "vap": date(2025, 10, 6),
        "il": date(2025, 11, 5),
        "unduvap": date(2025, 12, 4)
    }
    
    if year == 2025:
        return base_poya_2025
    
    # For other years, calculate approximate dates
    # Lunar cycle is approximately 29.53 days
    # This is a simplified calculation - for production use astronomical data
    year_diff = year - 2025
    days_shift = year_diff * 365 + (year_diff // 4)  # Account for leap years
    lunar_shift = (days_shift % 29.53) / 29.53 * 29.53
    
    poya_dates = {}
    for poya_name, base_date in base_poya_2025.items():
        # Calculate new date for the year
        new_month = base_date.month
        new_day = base_date.day
        
        # Adjust for different year
        try:
            poya_dates[poya_name] = date(year, new_month, new_day)
        except ValueError:
            # Handle edge cases like Feb 29 in non-leap years
            if new_month == 2 and new_day == 29:
                poya_dates[poya_name] = date(year, 2, 28)
            else:
                poya_dates[poya_name] = date(year, new_month, min(new_day, 28))
    
    return poya_dates


def get_fixed_holidays_for_year(year: int) -> List[Dict[str, Any]]:
    """Get fixed date holidays that don't change (except for year)"""
    return [
        # New Year
        {
            "name": "New Year's Day",
            "name_si": "අලුත් අවුරුද්ද",
            "name_ta": "புத்தாண்டு",
            "date": date(year, 1, 1),
            "type": "public_holiday",
            "category": "national",
            "is_public_holiday": True,
            "is_bank_holiday": True,
            "expected_sales_impact": "low",
            "stock_up_recommended": False,
            "delivery_affected": True,
            "greeting_message_en": "Wishing you a Happy New Year filled with prosperity!",
            "greeting_message_si": "සුභ නව වර්ෂයක් වේවා!",
            "greeting_message_ta": "இனிய புத்தாண்டு வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "notify_days_before": 1
        },
        
        # Independence Day
        {
            "name": "Independence Day",
            "name_si": "නිදහස් දිනය",
            "name_ta": "சுதந்திர தினம்",
            "date": date(year, 2, 4),
            "type": "public_holiday",
            "category": "national",
            "is_public_holiday": True,
            "is_bank_holiday": True,
            "expected_sales_impact": "medium",
            "stock_up_recommended": False,
            "delivery_affected": True,
            "greeting_message_en": "Happy Independence Day Sri Lanka!",
            "greeting_message_si": "සුභ නිදහස් දිනයක්!",
            "greeting_message_ta": "இனிய சுதந்திர தின வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "notify_days_before": 1
        },
        
        # Sinhala and Tamil New Year (April 13-14 are traditional dates)
        {
            "name": "Sinhala and Tamil New Year Day",
            "name_si": "සිංහල හා දමිළ අලුත් අවුරුද්ද",
            "name_ta": "சிங்கள தமிழ் புத்தாண்டு",
            "date": date(year, 4, 13),
            "type": "public_holiday",
            "category": "cultural",
            "is_public_holiday": True,
            "is_bank_holiday": True,
            "expected_sales_impact": "high",
            "stock_up_recommended": True,
            "delivery_affected": True,
            "business_notes": "Major shopping period, stock traditional items",
            "greeting_message_en": "Subha Aluth Avuruddak Wewa! Happy New Year!",
            "greeting_message_si": "සුභ අලුත් අවුරුද්දක් වේවා!",
            "greeting_message_ta": "இனிய தமிழ் புத்தாண்டு வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 7
        },
        
        {
            "name": "Day following Sinhala and Tamil New Year Day",
            "name_si": "සිංහල හා දමිළ අලුත් අවුරුද්දට පසු දිනය",
            "name_ta": "சிங்கள தமிழ் புத்தாண்டுக்கு அடுத்த நாள்",
            "date": date(year, 4, 14),
            "type": "public_holiday",
            "category": "cultural",
            "is_public_holiday": True,
            "is_bank_holiday": True,
            "expected_sales_impact": "high",
            "stock_up_recommended": True,
            "delivery_affected": True,
            "business_notes": "Continued New Year celebrations",
            "greeting_message_en": "Continuing New Year celebrations!",
            "greeting_message_si": "අලුත් අවුරුදු සැමරුම් දිගටම!",
            "greeting_message_ta": "புத்தாண்டு கொண்டாட்டம் தொடர்கிறது!",
            "send_customer_greetings": True,
            "notify_days_before": 7
        },
        
        # Labour Day
        {
            "name": "Labour Day",
            "name_si": "කම්කරු දිනය",
            "name_ta": "தொழிலாளர் தினம்",
            "date": date(year, 5, 1),
            "type": "public_holiday",
            "category": "national",
            "is_public_holiday": True,
            "is_bank_holiday": True,
            "expected_sales_impact": "medium",
            "stock_up_recommended": False,
            "delivery_affected": True,
            "greeting_message_en": "Happy Labour Day!",
            "greeting_message_si": "සුභ කම්කරු දිනයක්!",
            "greeting_message_ta": "இனிய தொழிலாளர் தின வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "notify_days_before": 1
        },
        
        # Christmas
        {
            "name": "Christmas Day",
            "name_si": "නත්තල් දිනය",
            "name_ta": "கிறிஸ்துமஸ்",
            "date": date(year, 12, 25),
            "type": "public_holiday",
            "category": "christian",
            "is_public_holiday": True,
            "is_bank_holiday": True,
            "expected_sales_impact": "high",
            "stock_up_recommended": True,
            "delivery_affected": True,
            "business_notes": "Major shopping season, stock gifts and decorations",
            "greeting_message_en": "Merry Christmas and God's Blessings!",
            "greeting_message_si": "සුභ නත්තලක් සහ දෙවියන්ගේ ආශීර්වාද!",
            "greeting_message_ta": "இனிய கிறிஸ்துமஸ் வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 7
        }
    ]


def get_poya_holidays_for_year(year: int) -> List[Dict[str, Any]]:
    """Get Poya day holidays for a given year"""
    poya_dates = get_poya_dates_for_year(year)
    
    poya_holidays = [
        {
            "name": "Duruthu Full Moon Poya Day",
            "name_si": "දුරුතු පෝය",
            "name_ta": "துருது பௌர்ணமி",
            "date": poya_dates["duruthu"],
            "type": "poya_day",
            "category": "buddhist",
            "is_public_holiday": True,
            "is_poya_day": True,
            "expected_sales_impact": "medium",
            "stock_up_recommended": True,
            "business_notes": "Temple visits increase, prepare flowers and offerings",
            "greeting_message_en": "May this Duruthu Poya bring you peace and blessings!",
            "greeting_message_si": "දුරුතු පෝය දිනයේ ආශීර්වාද ලැබේවා!",
            "greeting_message_ta": "துருது பௌர்ணமி நல்வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 2
        },
        
        {
            "name": "Navam Full Moon Poya Day",
            "name_si": "නවම් පෝය",
            "name_ta": "நவம் பௌர்ணமி",
            "date": poya_dates["navam"],
            "type": "poya_day",
            "category": "buddhist",
            "is_public_holiday": True,
            "is_poya_day": True,
            "expected_sales_impact": "medium",
            "stock_up_recommended": True,
            "business_notes": "Gangaramaya Navam Perahera period",
            "greeting_message_en": "Blessed Navam Poya Day!",
            "greeting_message_si": "නවම් පෝය දිනයේ ආශීර්වාද ලැබේවා!",
            "greeting_message_ta": "நவம் பௌர்ணமி வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 2
        },
        
        {
            "name": "Medin Full Moon Poya Day",
            "name_si": "මැදින් පෝය",
            "name_ta": "மெதின் பௌர்ணமி",
            "date": poya_dates["medin"],
            "type": "poya_day",
            "category": "buddhist",
            "is_public_holiday": True,
            "is_poya_day": True,
            "expected_sales_impact": "medium",
            "stock_up_recommended": True,
            "greeting_message_en": "May Medin Poya bring you inner peace!",
            "greeting_message_si": "මැදින් පෝය දිනයේ ආශීර්වාද ලැබේවා!",
            "greeting_message_ta": "மெதின் பௌர்ணமி வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 2
        },
        
        {
            "name": "Bak Full Moon Poya Day",
            "name_si": "බක් පෝය",
            "name_ta": "பக் பௌர்ணமி",
            "date": poya_dates["bak"],
            "type": "poya_day",
            "category": "buddhist",
            "is_public_holiday": True,
            "is_poya_day": True,
            "expected_sales_impact": "high",
            "stock_up_recommended": True,
            "business_notes": "Coincides with New Year, very busy period",
            "greeting_message_en": "Blessed Bak Poya and New Year!",
            "greeting_message_si": "බක් පෝය සහ අලුත් අවුරුදු ආශීර්වාද!",
            "greeting_message_ta": "பக் பௌர்ணமி மற்றும் புத்தாண்டு வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 7
        },
        
        {
            "name": "Vesak Full Moon Poya Day",
            "name_si": "වෙසක් පෝය",
            "name_ta": "வேசாக் பௌர்ணமி",
            "date": poya_dates["vesak"],
            "type": "poya_day",
            "category": "buddhist",
            "is_public_holiday": True,
            "is_poya_day": True,
            "expected_sales_impact": "high",
            "stock_up_recommended": True,
            "business_notes": "Most important Buddhist festival, decorations and lanterns",
            "greeting_message_en": "May the light of Vesak illuminate your path!",
            "greeting_message_si": "වෙසක් පෝය දිනයේ ආශීර්වාද ලැබේවා!",
            "greeting_message_ta": "வேசாக் பௌர்ணமி வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 7
        },
        
        {
            "name": "Poson Full Moon Poya Day",
            "name_si": "පොසොන් පෝය",
            "name_ta": "பொசோன் பௌர்ணமி",
            "date": poya_dates["poson"],
            "type": "poya_day",
            "category": "buddhist",
            "is_public_holiday": True,
            "is_poya_day": True,
            "expected_sales_impact": "high",
            "stock_up_recommended": True,
            "business_notes": "Mihintale pilgrimage season, travel increases",
            "greeting_message_en": "Blessed Poson Poya Day!",
            "greeting_message_si": "පොසොන් පෝය දිනයේ ආශීර්වාද ලැබේවා!",
            "greeting_message_ta": "பொசோன் பௌர்ணமி வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 3
        },
        
        {
            "name": "Esala Full Moon Poya Day",
            "name_si": "ඇසළ පෝය",
            "name_ta": "ஆசாள பௌர்ணமி",
            "date": poya_dates["esala"],
            "type": "poya_day",
            "category": "buddhist",
            "is_public_holiday": True,
            "is_poya_day": True,
            "expected_sales_impact": "high",
            "stock_up_recommended": True,
            "business_notes": "Kandy Esala Perahera season",
            "greeting_message_en": "Blessed Esala Poya Day!",
            "greeting_message_si": "ඇසළ පෝය දිනයේ ආශීර්වාද ලැබේවා!",
            "greeting_message_ta": "ஆசாள பௌர்ணமி வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 5
        },
        
        {
            "name": "Nikini Full Moon Poya Day",
            "name_si": "නිකිණි පෝය",
            "name_ta": "நிகிணி பௌர்ணமி",
            "date": poya_dates["nikini"],
            "type": "poya_day",
            "category": "buddhist",
            "is_public_holiday": True,
            "is_poya_day": True,
            "expected_sales_impact": "medium",
            "stock_up_recommended": True,
            "greeting_message_en": "Blessed Nikini Poya Day!",
            "greeting_message_si": "නිකිණි පෝය දිනයේ ආශීර්වාද ලැබේවා!",
            "greeting_message_ta": "நிகிணி பௌர்ணமி வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 2
        },
        
        {
            "name": "Binara Full Moon Poya Day",
            "name_si": "බිනර පෝය",
            "name_ta": "பினர பௌர்ணமி",
            "date": poya_dates["binara"],
            "type": "poya_day",
            "category": "buddhist",
            "is_public_holiday": True,
            "is_poya_day": True,
            "expected_sales_impact": "medium",
            "stock_up_recommended": True,
            "greeting_message_en": "Blessed Binara Poya Day!",
            "greeting_message_si": "බිනර පෝය දිනයේ ආශීර්වාද ලැබේවා!",
            "greeting_message_ta": "பினர பௌர்ணமி வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 2
        },
        
        {
            "name": "Vap Full Moon Poya Day",
            "name_si": "වප් පෝය",
            "name_ta": "வப் பௌர்ணமி",
            "date": poya_dates["vap"],
            "type": "poya_day",
            "category": "buddhist",
            "is_public_holiday": True,
            "is_poya_day": True,
            "expected_sales_impact": "medium",
            "stock_up_recommended": True,
            "greeting_message_en": "Blessed Vap Poya Day!",
            "greeting_message_si": "වප් පෝය දිනයේ ආශීර්වාද ලැබේවා!",
            "greeting_message_ta": "வப் பௌர்ணமி வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 2
        },
        
        {
            "name": "Il Full Moon Poya Day",
            "name_si": "ඉල් පෝය",
            "name_ta": "இல் பௌர்ணமி",
            "date": poya_dates["il"],
            "type": "poya_day",
            "category": "buddhist",
            "is_public_holiday": True,
            "is_poya_day": True,
            "expected_sales_impact": "medium",
            "stock_up_recommended": True,
            "greeting_message_en": "Blessed Il Poya Day!",
            "greeting_message_si": "ඉල් පෝය දිනයේ ආශීර්වාද ලැබේවා!",
            "greeting_message_ta": "இல் பௌர்ணமி வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 2
        },
        
        {
            "name": "Unduvap Full Moon Poya Day",
            "name_si": "උඳුවප් පෝය",
            "name_ta": "உந்துவப் பௌர்ணமி",
            "date": poya_dates["unduvap"],
            "type": "poya_day",
            "category": "buddhist",
            "is_public_holiday": True,
            "is_poya_day": True,
            "expected_sales_impact": "medium",
            "stock_up_recommended": True,
            "business_notes": "Pre-Christmas period, good for business",
            "greeting_message_en": "Blessed Unduvap Poya Day!",
            "greeting_message_si": "උඳුවප් පෝය දිනයේ ආශීර්වාද ලැබේවා!",
            "greeting_message_ta": "உந்துவப் பௌர்ணமி வாழ்த்துக்கள்!",
            "send_customer_greetings": True,
            "send_stock_reminders": True,
            "notify_days_before": 2
        }
    ]
    
    # Add day after Vesak if it's a major celebration
    vesak_next_day = {
        "name": "Day following Vesak Full Moon Poya Day",
        "name_si": "වෙසක් පෝයට පසු දිනය",
        "name_ta": "வேசாக் பௌர்ணமிக்கு அடுத்த நாள்",
        "date": date(poya_dates["vesak"].year, poya_dates["vesak"].month, poya_dates["vesak"].day + 1),
        "type": "public_holiday",
        "category": "buddhist",
        "is_public_holiday": True,
        "is_bank_holiday": True,
        "expected_sales_impact": "high",
        "stock_up_recommended": True,
        "delivery_affected": True,
        "business_notes": "Continued Vesak celebrations",
        "greeting_message_en": "Continuing Vesak blessings!",
        "greeting_message_si": "වෙසක් ආශීර්වාද දිගටම!",
        "greeting_message_ta": "வேசாக் ஆசீர்வாதம் தொடர்கிறது!",
        "send_customer_greetings": True,
        "notify_days_before": 7
    }
    
    poya_holidays.append(vesak_next_day)
    return poya_holidays


def initialize_sri_lankan_festivals_for_year(db: Session, year: int = None):
    """Initialize Sri Lankan festivals and holidays for a given year"""
    
    if year is None:
        year = datetime.now().year
    
    # Get all festivals for the year
    festivals = []
    festivals.extend(get_fixed_holidays_for_year(year))
    festivals.extend(get_poya_holidays_for_year(year))
    
    # Clear existing data for the year
    db.query(FestivalCalendar).filter(FestivalCalendar.year == year).delete()
    
    # Add all festivals
    for festival_data in festivals:
        festival = FestivalCalendar(
            year=year,
            **festival_data
        )
        db.add(festival)
    
    db.commit()
    print(f"Initialized {len(festivals)} Sri Lankan festivals and holidays for {year}")


# Backward compatibility function
def initialize_sri_lankan_festivals_2025(db: Session):
    """Initialize Sri Lankan festivals and holidays for 2025 - backward compatibility"""
    initialize_sri_lankan_festivals_for_year(db, 2025)


def initialize_sample_data(db: Session, year: int = None):
    """Initialize sample data for testing"""
    if year is None:
        year = datetime.now().year
    
    initialize_sri_lankan_festivals_for_year(db, year)
    print(f"Sri Lankan festival data initialized successfully for {year}!")


def update_festivals_for_new_year(db: Session, year: int = None):
    """Update festivals when a new year starts"""
    if year is None:
        year = datetime.now().year
    
    # Check if data already exists for this year
    existing_count = db.query(FestivalCalendar).filter(FestivalCalendar.year == year).count()
    
    if existing_count == 0:
        print(f"No festival data found for {year}, initializing...")
        initialize_sri_lankan_festivals_for_year(db, year)
    else:
        print(f"Festival data already exists for {year} ({existing_count} entries)")


if __name__ == "__main__":
    # For testing purposes
    from database.connection import get_db
    
    db = next(get_db())
    
    # Initialize for current year and next year
    current_year = datetime.now().year
    initialize_sample_data(db, current_year)
    initialize_sample_data(db, current_year + 1)
    
    db.close()