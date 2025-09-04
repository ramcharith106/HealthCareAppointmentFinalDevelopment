export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  profileImage: string;
  bio: string;
  clinic: {
    name: string;
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  availability: TimeSlot[];
  registrationNumber: string;
  professionalMemberships: string[];
}

export interface TimeSlot {
  date: string;
  slots: string[];
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  profileImage?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'follow-up' | 'emergency';
  notes?: string;
  fee: number;
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface SearchFilters {
  specialty?: string;
  location?: string;
  availableToday?: boolean;
  maxFee?: number;
  minRating?: number;
  minExperience?: number;
}
