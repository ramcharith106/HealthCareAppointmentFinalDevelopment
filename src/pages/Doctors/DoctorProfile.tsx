import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Briefcase, MapPin, IndianRupee, CheckCircle, AlertCircle } from 'lucide-react';
import { doc, collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Doctor } from '@/types';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const DoctorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const docRef = doc(db, 'doctors', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const docData = { id: docSnap.id, ...docSnap.data() } as Doctor;
        setDoctor(docData);

        if (selectedDate && !docData.availability?.some(d => d.date === selectedDate)) {
            setSelectedDate(docData.availability?.[0]?.date || null);
        } else if (!selectedDate) {
            setSelectedDate(docData.availability?.[0]?.date || null);
        }
      } else {
        setDoctor(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to doctor profile:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, selectedDate]);

  const handleBooking = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (!selectedDate || !selectedTime || !doctor) {
      alert('Please select a date and time slot.');
      return;
    }

    setIsBooking(true);
    setBookingStatus(null);

    try {
      await addDoc(collection(db, 'appointments'), {
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        patientId: user.uid,
        patientName: user.displayName,
        date: selectedDate,
        time: selectedTime,
        status: 'scheduled',
        fee: doctor.consultationFee,
        createdAt: serverTimestamp(),
      });
      setBookingStatus('success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setBookingStatus('error');
    } finally {
      setIsBooking(false);
    }
  };
  
  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  if (!doctor) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-800">Doctor not found</h2>
      <p className="text-gray-600 mt-2">The profile you are looking for does not exist.</p>
      <Link to="/doctors" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
        Back to Doctors List
      </Link>
    </div>
  );
  
  const selectedSlots = doctor.availability?.find(d => d.date === selectedDate)?.slots || [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="bg-white rounded-lg shadow-md p-6 md:flex md:space-x-8">
            <img src={doctor.profileImage} alt={doctor.name} className="w-32 h-32 rounded-full mx-auto md:mx-0 object-cover ring-4 ring-blue-100"/>
            <div className="flex-1 mt-6 md:mt-0">
              <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
              <p className="text-blue-600 font-semibold text-lg mt-1">{doctor.specialty}</p>
              <p className="text-gray-600 text-sm">{doctor.qualification}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-gray-700">
                <div className="flex items-center space-x-1"><Star className="h-5 w-5 text-yellow-400 fill-current" /> <span className="font-semibold">{doctor.rating}</span> <span className="text-sm text-gray-500">({doctor.reviewCount} reviews)</span></div>
                <div className="flex items-center space-x-1"><Briefcase className="h-5 w-5 text-gray-400" /> <span>{doctor.experience} years experience</span></div>
                <div className="flex items-center space-x-1"><MapPin className="h-5 w-5 text-gray-400" /> <span>{doctor.clinic.name}, {doctor.clinic.city}</span></div>
              </div>
            </div>
            <div className="mt-6 md:mt-0 text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end text-3xl font-bold text-gray-800"><IndianRupee size={28}/> {doctor.consultationFee}</div>
                <p className="text-gray-500 text-sm">Consultation Fee</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">About Dr. {doctor.name.split(' ').pop()}</h2>
                <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
            </div>
            <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Book an Appointment</h2>
              {doctor.availability && doctor.availability.length > 0 ? (
                <>
                  <div className="mb-4">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Select a Date</h3>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {doctor.availability.map(day => (
                        <button key={day.date} onClick={() => { setSelectedDate(day.date); setSelectedTime(null); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedDate === day.date ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Available Slots for {new Date(selectedDate || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedSlots.length > 0 ? selectedSlots.map(slot => (
                        <button key={slot} onClick={() => setSelectedTime(slot)} className={`py-2 rounded-md transition-colors text-sm ${selectedTime === slot ? 'bg-blue-600 text-white' : 'border border-blue-500 text-blue-600 hover:bg-blue-50'}`}>{slot}</button>
                      )) : (
                        <p className="col-span-3 text-sm text-gray-500">No slots available on this day.</p>
                      )}
                    </div>
                  </div>
                  <button onClick={handleBooking} disabled={isBooking || !selectedTime} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                    {isBooking ? <LoadingSpinner size="sm" /> : 'Confirm Appointment'}
                  </button>
                </>
              ) : (
                <p className="text-gray-500 text-center">This doctor has not set their availability yet.</p>
              )}
              {bookingStatus === 'success' && <div className="flex items-center mt-4 text-green-600"><CheckCircle className="mr-2" /> Appointment booked! Redirecting...</div>}
              {bookingStatus === 'error' && <div className="flex items-center mt-4 text-red-600"><AlertCircle className="mr-2" /> Failed to book. Please try again.</div>}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorProfile;