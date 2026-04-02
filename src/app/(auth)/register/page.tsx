// 'use client';
// import { useRouter } from 'next/navigation';
// import React, { useState } from 'react';
// import { registerAction } from '@/app/actions/auth';
// import Link from 'next/link';

// export default function RegisterPage() {
//   const router = useRouter();
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
  
//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
    
//     const formData = new FormData(e.currentTarget);
//     const result = await registerAction(formData);
    
//     if (result?.error) {
//       setError(result.error);
//       setLoading(false);
//     } else {
//       setSuccess(true);
//       setTimeout(() => {
//         router.push('/');
//         router.refresh();
//       }, 1500);
//     }
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
//       <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-10 text-center animate-in fade-in zoom-in-95 duration-500">
//         <div className="flex items-center justify-center gap-4 mb-6">
//           <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 104.1 0h-4.1z" clipRule="evenodd" />
//             </svg>
//           </div>
//           <h1 className="text-4xl font-black text-slate-800 tracking-tight">Join Coinly</h1>
//         </div>
//         <p className="text-slate-400 font-medium mb-10">Start tracking your wealth today</p>
        
//         {error && (
//           <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold animate-in shake-in duration-300">
//             {error}
//           </div>
//         )}
//         {success && (
//           <div className="mb-6 p-4 rounded-2xl bg-green-50 text-green-600 border border-green-100 text-sm font-bold animate-in fade-in duration-300">
//             Account created! Redirecting...
//           </div>
//         )}
        
//         <form onSubmit={handleSubmit} className="space-y-4 text-left">
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
//             <input 
//               name="fullName"
//               type="text" 
//               placeholder="John Doe"
//               className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300" 
//               required 
//               />
//           </div>
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
//             <input 
//               name="email"
//               type="email" 
//               placeholder="john@example.com"
//               className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300" 
//               required 
//               />
//           </div>
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
//             <input 
//               name="username"
//               type="text" 
//               placeholder="johndoe123"
//               className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300" 
//               required 
//               />
//           </div>
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
//             <input 
//               name="password"
//               type="password" 
//               placeholder="••••••••"
//               className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300" 
//               required 
//               />
//           </div>
//           <button 
//             type="submit" 
//             disabled={loading || success}
//             className="w-full relative flex items-center justify-center bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/30 active:scale-[0.98] mt-4 disabled:opacity-80 disabled:cursor-wait transition-all"
//           >
//             {loading ? (
//               <>
//                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Creating Account...
//               </>
//             ) : (
//               'Create Account'
//             )}
//           </button>
//         </form>
        
//         <p className="mt-10 text-slate-500 font-medium">
//           Already a member? <Link href="/login" className="text-blue-600 font-black hover:underline underline-offset-4">Sign in</Link>
//         </p>
//       </div>
//     </div>
//   );
// }





// --------------------------------------------
// To see the register page
// Comment the last 3 lines and remove comment from the above code
// Also check the page.tsx of register
// -----------------------------------------------




import { redirect } from 'next/navigation'; 
export default function RegisterPage() {
    redirect('/login');
}
