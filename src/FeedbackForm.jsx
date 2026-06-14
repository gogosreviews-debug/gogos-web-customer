import React, { useEffect, useState } from "react";
import axios from "axios";

const sectionBox = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 16px #0001",
  padding: 24,
  marginBottom: 28,
  border: '1px solid #ececec',
};

const labelStyle = { fontWeight: 600, marginBottom: 12, fontSize: 18 };
const fieldLabel = { fontWeight: 500, marginBottom: 6 };
const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  fontFamily: 'Google Sans, sans-serif',
  fontSize: 16,
  marginBottom: 12
};
const buttonStyle = {
  width: "100%",
  background: "#000000ff",
  color: "#fff",
  fontWeight: 700,
  border: 0,
  borderRadius: 8,
  padding: 16,
  fontSize: 18,
  cursor: "pointer",
  fontFamily: 'Google Sans, sans-serif',
  marginTop: 10
};

const BASE_URL = "https://gogos-backend-review.onrender.com";

const whatWentWrongOptions = [
  "Slow Service", "Food issue", "Staff", "Cleanliness", "Other"
];
const whatDidYouLoveOptions = [
  "Burger", "Fries", "Drinks", "Service", "Vibe"
];

const getRatingColor = rating => {
  if (rating <= 2) return "#ff4d4f";
  if (rating === 3) return "#ff9800";
  if (rating === 4) return "#8bc34a";
  return "#2e7d32";
};

function StarRating({ value, onChange }) {
  const selectedValue = Number(value);

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      {[1, 2, 3, 4, 5].map(starValue => (
        <button
          key={starValue}
          type="button"
          onClick={() => onChange(starValue)}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 28,
            cursor: "pointer",
            padding: 0,
            lineHeight: 1,
            color: starValue <= selectedValue ? getRatingColor(starValue) : "#cfcfcf"
          }}
          aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const getInitialFormState = () => ({
  name: "",
  email: "",
  phone: "",
  overallExperience: "",
  likedMost: [],
  ratings: {
    foodQuality: "",
    service: "",
    ambiance: "",
    environment: ""
  },
  waiterDetails: [{ servedBy: "", rateWaiter: "" }],
  whatWentWrong: [],
  whatWentWrongDetails: "",
  whatDidYouLove: [],
  nextBranchLoc: "",
  additionalComments: ""
});

export default function FeedbackForm() {
  const [form, setForm] = useState(getInitialFormState);
  const [waiters, setWaiters] = useState([]);
  const [showWhatWentWrong, setShowWhatWentWrong] = useState(false);
  const [showWhatDidYouLove, setShowWhatDidYouLove] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/waiters`).then(res => {
      setWaiters(res.data.data || []);
    });
  }, []);

  useEffect(() => {
    const ratings = Object.values(form.ratings).map(Number);
    setShowWhatWentWrong(ratings.some(r => r && r <= 3));
    setShowWhatDidYouLove(ratings.every(r => r && r >= 4));
  }, [form.ratings]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [field]: value }
    }));
  };

  const handleLikedMost = option => {
    setForm(prev => {
      const likedMost = prev.likedMost.includes(option)
        ? prev.likedMost.filter(o => o !== option)
        : [...prev.likedMost, option];
      return { ...prev, likedMost };
    });
  };

  const handleWhatWentWrong = option => {
    setForm(prev => {
      const whatWentWrong = prev.whatWentWrong.includes(option)
        ? prev.whatWentWrong.filter(o => o !== option)
        : [...prev.whatWentWrong, option];
      return { ...prev, whatWentWrong };
    });
  };

  const handleWhatDidYouLove = option => {
    setForm(prev => {
      const whatDidYouLove = prev.whatDidYouLove.includes(option)
        ? prev.whatDidYouLove.filter(o => o !== option)
        : [...prev.whatDidYouLove, option];
      return { ...prev, whatDidYouLove };
    });
  };

  const handleWaiterChange = value => {
    setForm(prev => ({
      ...prev,
      waiterDetails: [{ ...prev.waiterDetails[0], servedBy: value }]
    }));
  };

  const handleWaiterRatingChange = value => {
    setForm(prev => ({
      ...prev,
      waiterDetails: [{ ...prev.waiterDetails[0], rateWaiter: value }]
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const hasAllSectionRatings = Object.values(form.ratings).every(rating => {
      const numericRating = Number(rating);
      return numericRating >= 1 && numericRating <= 5;
    });

    if (!Number(form.overallExperience) || !hasAllSectionRatings || !Number(form.waiterDetails[0].rateWaiter)) {
      alert("Please provide all star ratings before submitting.");
      return;
    }

    if (!form.waiterDetails[0].servedBy) {
      alert("Please select your waiter before submitting.");
      return;
    }

    const trimmedNextBranchLoc = form.nextBranchLoc.trim();

    const payload = {
      ...form,
      overallExperience: Number(form.overallExperience),
      ratings: {
        foodQuality: Number(form.ratings.foodQuality),
        service: Number(form.ratings.service),
        ambiance: Number(form.ratings.ambiance),
        environment: Number(form.ratings.environment)
      },
      waiterDetails: [{
        servedBy: form.waiterDetails[0].servedBy,
        rateWaiter: Number(form.waiterDetails[0].rateWaiter)
      }],
      whatWentWrong: showWhatWentWrong ? form.whatWentWrong : undefined,
      whatWentWrongDetails: showWhatWentWrong && form.whatWentWrong.length > 0 ? form.whatWentWrongDetails : undefined,
      whatDidYouLove: showWhatDidYouLove ? form.whatDidYouLove : undefined,
      ...(trimmedNextBranchLoc ? { nextBranchLoc: trimmedNextBranchLoc } : {}),
      additionalComments: form.additionalComments
    };

    try {
      await axios.post(`${BASE_URL}/api/reviews`, payload);
      alert("Thank you for your feedback!");
      setForm(getInitialFormState());
      setShowWhatWentWrong(false);
      setShowWhatDidYouLove(false);
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      const fallbackMessage = "Could not submit feedback. Please check your inputs and try again.";
      alert(serverMessage || fallbackMessage);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 16, fontFamily: 'Google Sans, sans-serif', background: '#faf7f8' }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 100,
          height: 100,
          background: "#ffffffff",
          borderRadius: "50%",
          margin: "0 auto 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <img src="/logo.png" alt="Gogo's Logo" style={{ width: 100, height: 100, objectFit: 'contain', display: 'block' }} />
        </div>
        <div style={{ color: "#000000ff", fontWeight: 700, fontSize: 18, marginTop: 8 }}>GOGOS</div>
        <div style={{ fontSize: 32, fontWeight: 700, margin: '8px 0' }}>How was your <span style={{ color: "#000000ff" }}>experience?</span></div>
        <div style={{ color: "#888", fontSize: 16 }}>Your feedback helps us serve you better. It takes less than two minutes.</div>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={sectionBox}>
          <div style={labelStyle}>Your details</div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <input placeholder="Name" name="name" value={form.name} onChange={handleChange} required style={{ ...inputStyle, flex: 1 }} />
            <input placeholder="Email" name="email" value={form.email} onChange={handleChange} required style={{ ...inputStyle, flex: 1 }} />
          </div>
          <input placeholder="Phone" name="phone" value={form.phone} onChange={handleChange} required style={inputStyle} />
        </div>
        <div style={sectionBox}>
          <div style={labelStyle}>Your visit</div>
          <div style={{ marginBottom: 16 }}>
            <label style={fieldLabel}>Overall Experience *</label>
            <StarRating
              value={form.overallExperience}
              onChange={value => setForm(prev => ({ ...prev, overallExperience: value }))}
            />
          </div>
          <div style={fieldLabel}>What did you like most?</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {["Food quality", "Service", "Ambiance", "Environment"].map(opt => (
              <button type="button" key={opt} onClick={() => handleLikedMost(opt)} style={{
                background: form.likedMost.includes(opt) ? "#000000ff" : "#fff",
                color: form.likedMost.includes(opt) ? "#fff" : "#000000ff",
                border: "1px solid #000000ff", borderRadius: 20, padding: "4px 16px", cursor: "pointer", fontFamily: 'Google Sans, sans-serif', fontWeight: 500, marginBottom: 4
              }}>{opt}</button>
            ))}
          </div>
          <div style={labelStyle}>Rate the following</div>
          <div style={{ display: "flex", gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
            {["foodQuality", "service", "ambiance", "environment"].map(field => (
              <div key={field} style={{ flex: 1, minWidth: 120 }}>
                <label style={fieldLabel}>{field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}</label>
                <StarRating
                  value={form.ratings[field]}
                  onChange={value => handleRatingChange(field, value)}
                />
              </div>
            ))}
          </div>
        </div>
        <div style={sectionBox}>
          <div style={labelStyle}>Waiter service</div>
          <div style={{ display: "flex", gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={fieldLabel}>Waiter *</label>
              <select
                value={form.waiterDetails[0].servedBy}
                onChange={e => handleWaiterChange(e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">Select your waiter...</option>
                {waiters.length === 0 && <option value="" disabled>0 waiters available</option>}
                {waiters.map(w => (
                  <option key={w._id} value={w._id}>{w.fullName}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={fieldLabel}>Rate Waiter *</label>
              <StarRating
                value={form.waiterDetails[0].rateWaiter}
                onChange={value => handleWaiterRatingChange(value)}
              />
            </div>
          </div>
        </div>
        {showWhatWentWrong && (
          <div style={sectionBox}>
            <div style={labelStyle}>What went wrong?</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              {whatWentWrongOptions.map(opt => (
                <label key={opt} style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 400, fontFamily: 'Google Sans, sans-serif' }}>
                  <input
                    type="checkbox"
                    checked={form.whatWentWrong.includes(opt)}
                    onChange={() => handleWhatWentWrong(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
            {form.whatWentWrong.length > 0 && (
              <textarea
                placeholder="Please provide details"
                value={form.whatWentWrongDetails}
                onChange={e => setForm(prev => ({ ...prev, whatWentWrongDetails: e.target.value }))}
                style={{ ...inputStyle, minHeight: 60, marginBottom: 0 }}
              />
            )}
          </div>
        )}
        {showWhatDidYouLove && (
          <div style={sectionBox}>
            <div style={labelStyle}>What did you love?</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              {whatDidYouLoveOptions.map(opt => (
                <label key={opt} style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 400, fontFamily: 'Google Sans, sans-serif' }}>
                  <input
                    type="checkbox"
                    checked={form.whatDidYouLove.includes(opt)}
                    onChange={() => handleWhatDidYouLove(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        )}
        <div style={sectionBox}>
          <div style={labelStyle}>Where should be our next location?</div>
          <input
            placeholder="Suggest a location"
            name="nextBranchLoc"
            value={form.nextBranchLoc}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div style={sectionBox}>
          <div style={labelStyle}>Anything else?</div>
          <textarea
            placeholder="Anything else you'd like to share?"
            name="additionalComments"
            value={form.additionalComments}
            onChange={handleChange}
            style={{ ...inputStyle, minHeight: 60, marginBottom: 0 }}
          />
        </div>
        <button type="submit" style={buttonStyle}>
          Submit Review
        </button>
      </form>
      <div style={{ textAlign: "center", color: "#888", marginTop: 32, fontFamily: 'Google Sans, sans-serif' }}>
        Made with <span style={{ color: "#000000ff" }}>♥</span> for Gogo's guests
      </div>
    </div>
  );
}
