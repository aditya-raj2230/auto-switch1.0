'use client'
import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import EditForm from './EditForm';

const EditForm2 = ({ userData,userId }) => {
  const [formData, setFormData] = useState({
    type: 'car', // Default value can be 'car' or 'bike'
    manufacturer: '',
    model: '',
    year: '',
    location: '',
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter()
  const [addvehicle,setAddvehicle]=useState(true)
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData((prevData) => ({
        ...prevData,
        image: e.target.files[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const db = getFirestore();
    const storage = getStorage();

    try {
      let imageUrl = '';
      if (formData.image) {
        const storageRef = ref(storage, `vehicles/${formData.image.name}`);
        await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'users', userId, 'vehicles'), {
        type: formData.type,
        manufacturer: formData.manufacturer,
        model: formData.model,
        year: formData.year,
        location: formData.location,
        imageUrl,
      });
      setFormData({
        type: 'car', // Default value can be 'car' or 'bike'
        manufacturer: '',
        model: '',
        year: '',
        location: '',
        image: null,
      })
      router.push('/edit')

      setLoading(false);
      setAddvehicle(false)
      // Redirect or display success message
    } catch (error) {
      setError('Error adding document: ', error);
      setLoading(false);
      
    }
  };

  return (
    <div>
    {addvehicle ?
   <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6">
   <button
     className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-800"
     onClick={() => setAddvehicle(false)}
   >
     Back
   </button>
   <h2 className="text-3xl font-bold text-center text-indigo-600">Add Vehicle</h2>
   {error && <p className="text-red-500 text-center">{error}</p>}
   <form onSubmit={handleSubmit} className="space-y-6">
     <div>
       <label className="block text-sm font-medium text-gray-700">Type</label>
       <select
         name="type"
         value={formData.type}
         onChange={handleChange}
         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
       >
         <option value="car">Car</option>
         <option value="bike">Bike</option>
       </select>
     </div>
     <div>
       <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
       <input
         type="text"
         name="manufacturer"
         value={formData.manufacturer}
         onChange={handleChange}
         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
       />
     </div>
     <div>
       <label className="block text-sm font-medium text-gray-700">Model</label>
       <input
         type="text"
         name="model"
         value={formData.model}
         onChange={handleChange}
         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
       />
     </div>
     <div>
       <label className="block text-sm font-medium text-gray-700">Year</label>
       <input
         type="text"
         name="year"
         value={formData.year}
         onChange={handleChange}
         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
       />
     </div>
     <div>
       <label className="block text-sm font-medium text-gray-700">Location</label>
       <input
         type="text"
         name="location"
         value={formData.location}
         onChange={handleChange}
         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
       />
     </div>
     <div>
       <label className="block text-sm font-medium text-gray-700">Image</label>
       <input
         type="file"
         onChange={handleFileChange}
         className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
       />
     </div>
     <div>
       <button
         type="submit"
         className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
       >
         {loading ? 'Submitting...' : 'Submit'}
       </button>
     </div>
   </form>
 </div>:<EditForm/>}</div>
  );
};

export default EditForm2;
