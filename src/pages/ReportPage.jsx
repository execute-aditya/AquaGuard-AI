import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

export default function ReportPage() {
  const { user } = useAuth();
  const [issueType, setIssueType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refId, setRefId] = useState('');
  const fileInputRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!issueType) e.issueType = 'Please select an issue type';
    if (!location.trim()) e.location = 'Location is required';
    if (!description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');

    try {
      let imageUrl = null;

      if (imageFile) {
        const path = `${user.id}/${Date.now()}_${imageFile.name}`;
        const { error: uploadErr } = await supabase.storage
          .from('complaint-images').upload(path, imageFile);
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from('complaint-images').getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error: insertErr } = await supabase.from('complaints').insert({
        user_id: user.id,
        issue_type: issueType,
        location: location.trim(),
        description: description.trim(),
        image_url: imageUrl,
        status: 'Pending',
      });
      if (insertErr) throw insertErr;

      setRefId(`#AQG-${Math.floor(1000 + Math.random() * 9000)}`);
      setShowSuccess(true);
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIssueType(''); setLocation(''); setDescription('');
    setImageFile(null); setImagePreview(null);
    setErrors({}); setSubmitError(''); setShowSuccess(false);
  };

  return (
    <Layout>
      <main className="flex-grow flex items-center justify-center py-12 px-margin-x w-full max-w-container-max mx-auto">
        <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-level-1 p-8 relative overflow-hidden">
          {/* Form Content */}
          <div id="formContent" style={{ opacity: showSuccess ? 0 : 1, pointerEvents: showSuccess ? 'none' : 'auto', transition: 'opacity 0.5s' }}>
            <header className="mb-8">
              <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Report a Water Issue</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Please provide details about the water safety concern to help us investigate quickly.</p>
            </header>

            {submitError && (
              <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container font-label-sm text-label-sm">{submitError}</div>
            )}

            <div className="flex flex-col gap-stack-md">
              {/* Issue Type */}
              <div className="flex flex-col gap-stack-sm">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="issueType">Issue Type</label>
                <select className="w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all outline-none" id="issueType" value={issueType} onChange={(e) => setIssueType(e.target.value)}>
                  <option disabled value="">Select the type of issue</option>
                  <option value="dirty_water">Dirty or Discolored Water</option>
                  <option value="leakage">Pipe Leakage or Burst</option>
                  <option value="low_pressure">Low Water Pressure</option>
                  <option value="odor">Strange Odor or Taste</option>
                  <option value="other">Other</option>
                </select>
                {errors.issueType && <p className="text-error font-label-sm text-label-sm">{errors.issueType}</p>}
              </div>

              {/* Location */}
              <div className="flex flex-col gap-stack-sm">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="location">Location</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">location_on</span>
                  <input className="w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all outline-none" id="location" placeholder="Enter street address or coordinates" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                {errors.location && <p className="text-error font-label-sm text-label-sm">{errors.location}</p>}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-stack-sm">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="description">Description</label>
                <textarea className="w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all outline-none resize-none" id="description" placeholder="Describe the issue in detail..." rows="4" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                {errors.description && <p className="text-error font-label-sm text-label-sm">{errors.description}</p>}
              </div>

              {/* Image Upload */}
              <div className="flex flex-col gap-stack-sm mt-2">
                <label className="font-label-md text-label-md text-on-surface">Photo Evidence</label>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <div className="border-2 border-dashed border-outline-variant/60 rounded-xl p-8 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg object-contain" />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-secondary" style={{ fontSize: '28px' }}>water_drop</span>
                      </div>
                      <p className="font-label-md text-label-md text-secondary mb-1">Click to upload or drag and drop</p>
                      <p className="font-body-md text-body-md text-on-surface-variant text-sm">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button className="mt-6 w-full bg-brand-cyan hover:bg-brand-cyan-hover text-on-primary font-headline-md text-headline-md py-4 rounded-xl transition-colors duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50" type="button" disabled={loading} onClick={handleSubmit}>
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin">refresh</span><span>Processing...</span></>
                ) : (
                  <><span>Submit Complaint</span><span className="material-symbols-outlined">send</span></>
                )}
              </button>
            </div>
          </div>

          {/* Success State */}
          <div className={`absolute inset-0 bg-surface-container-lowest flex flex-col items-center justify-center p-8 transition-opacity duration-500 z-10 ${showSuccess ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '48px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2 text-center">Complaint Submitted</h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mb-8 max-w-sm">Thank you for reporting this issue. Our team has been notified and will investigate shortly. Reference ID: {refId}</p>
            <button className="px-8 py-3 rounded-lg border-2 border-secondary text-secondary font-label-md text-label-md hover:bg-secondary/5 transition-colors" onClick={resetForm}>Report Another Issue</button>
          </div>
        </div>
      </main>
    </Layout>
  );
}
