export const getPatientDisplayName = (patient: any, fallback = 'Unknown Patient') => {
  if (!patient) return fallback;

  const fullName = [patient.first_name, patient.last_name].filter(Boolean).join(' ').trim();

  return (
    fullName ||
    patient.name ||
    patient.patient_name ||
    patient.patient_code ||
    fallback
  );
};
