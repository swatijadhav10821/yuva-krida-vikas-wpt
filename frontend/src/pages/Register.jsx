   import { useState } from 'react';
   import { Link, useNavigate } from 'react-router-dom';
   import api from '../api';

   function Register() {
     const [form, setForm] = useState({
       name: '',
       email: '',
       password: '',
       confirmPassword: '',
       phone: '',
       gender: '',
       dob: '',
       address: '',
       district: '',
       emergency_phone: '',
       sport: ''
     });
     const [error, setError] = useState('');
     const navigate = useNavigate();

     const inputClass = 'w-full border rounded px-3 py-2 mb-4';

     function handleChange(e) {
       setForm({ ...form, [e.target.name]: e.target.value });
     }

     async function handleSubmit(e) {
       e.preventDefault();
       setError('');

       if (!form.name || !form.email || !form.password || !form.phone || !form.gender || !form.dob || !form.district) {
         setError('Please fill all required fields');
         return;
       }

       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
         setError('Enter a valid email');
         return;
       }

       if (!/^[0-9]{10}$/.test(form.phone)) {
         setError('Phone must be 10 digits');
         return;
       }

       if (form.emergency_phone && !/^[0-9]{10}$/.test(form.emergency_phone)) {
         setError('Emergency phone must be 10 digits');
         return;
       }

       if (form.password.length < 6) {
         setError('Password must be at least 6 characters');
         return;
       }

       if (form.password !== form.confirmPassword) {
         setError('Passwords do not match');
         return;
       }

       try {
         await api.post('/register', {
           name: form.name,
           email: form.email,
           password: form.password,
           phone: form.phone,
           gender: form.gender,
           dob: form.dob,
           address: form.address,
           district: form.district,
           emergency_phone: form.emergency_phone,
           sport: form.sport
         });
         navigate('/login');
       } catch (err) {
         if (err.response) {
           setError(err.response.data.message);
         } else {
           setError('Cannot reach the server');
         }
       }
     }

     return (
       <div
         className="photo-bg min-h-[calc(100vh-7.5rem)] flex items-center justify-center px-6 py-10"
         style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(/images/court.jpg)' }}
       >
       <div className="w-full max-w-xl bg-white p-8 rounded shadow-lg">
         <h1 className="text-2xl font-bold text-blue-800 mb-6">Create your account</h1>

         {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}

         <form onSubmit={handleSubmit}>
           <label className="block mb-1">Full name *</label>
           <input type="text" name="name" value={form.name} onChange={handleChange} className={inputClass} />

           <label className="block mb-1">Email *</label>
           <input type="text" name="email" value={form.email} onChange={handleChange} className={inputClass} />

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block mb-1">Password *</label>
               <input type="password" name="password" value={form.password} onChange={handleChange} className={inputClass} />
             </div>
             <div>
               <label className="block mb-1">Confirm password *</label>
               <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className={inputClass} />
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block mb-1">Phone *</label>
               <input type="text" name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
             </div>
             <div>
               <label className="block mb-1">Emergency phone</label>
               <input type="text" name="emergency_phone" value={form.emergency_phone} onChange={handleChange} className={inputClass} />
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block mb-1">Gender *</label>
               <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                 <option value="">Select</option>
                 <option value="Male">Male</option>
                 <option value="Female">Female</option>
                 <option value="Other">Other</option>
               </select>
             </div>
             <div>
               <label className="block mb-1">Date of birth *</label>
               <input type="date" name="dob" value={form.dob} onChange={handleChange} className={inputClass} />
             </div>
           </div>

           <label className="block mb-1">Address</label>
           <input type="text" name="address" value={form.address} onChange={handleChange} className={inputClass} />

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block mb-1">District *</label>
               <input type="text" name="district" value={form.district} onChange={handleChange} className={inputClass} />
             </div>
             <div>
               <label className="block mb-1">Sport</label>
               <select name="sport" value={form.sport} onChange={handleChange} className={inputClass}>
                 <option value="">None</option>
                 <option value="Cricket">Cricket</option>
                 <option value="Badminton">Badminton</option>
                 <option value="Shooting">Shooting</option>
                 <option value="Wrestling">Wrestling</option>
                 <option value="Hockey">Hockey</option>
               </select>
             </div>
           </div>

           <button type="submit" className="w-full bg-blue-800 text-white py-2 rounded">Register</button>
         </form>

         <p className="mt-4 text-sm">
           Already have an account? <Link to="/login" className="text-blue-800 underline">Login</Link>
         </p>
       </div>
       </div>
     );
   }

   export default Register;