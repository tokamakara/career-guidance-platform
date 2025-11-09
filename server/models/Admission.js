class Admission {
  constructor(data) {
    this.id = data.id;
    this.studentId = data.studentId;
    this.institutionId = data.institutionId;
    this.courseId = data.courseId;
    this.facultyId = data.facultyId;
    this.applicationId = data.applicationId;
    this.status = data.status || 'offered'; // offered, accepted, declined, withdrawn
    this.offerDate = data.offerDate || new Date();
    this.responseDeadline = data.responseDeadline;
    this.acceptedDate = data.acceptedDate;
    this.declinedDate = data.declinedDate;
    this.notes = data.notes;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toFirestore() {
    return {
      studentId: this.studentId,
      institutionId: this.institutionId,
      courseId: this.courseId,
      facultyId: this.facultyId,
      applicationId: this.applicationId,
      status: this.status,
      offerDate: this.offerDate,
      responseDeadline: this.responseDeadline,
      acceptedDate: this.acceptedDate,
      declinedDate: this.declinedDate,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Admission({
      id: doc.id,
      ...data
    });
  }

  // Validate admission data
  validate() {
    const errors = [];

    if (!this.studentId) errors.push('Student ID is required');
    if (!this.institutionId) errors.push('Institution ID is required');
    if (!this.courseId) errors.push('Course ID is required');
    if (!this.facultyId) errors.push('Faculty ID is required');
    if (!this.applicationId) errors.push('Application ID is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check if admission offer is still valid
  isOfferValid() {
    if (this.status !== 'offered') return false;
    if (!this.responseDeadline) return true;
    
    return new Date() <= this.responseDeadline.toDate();
  }

  // Accept admission offer
  accept() {
    if (this.status !== 'offered') {
      throw new Error('Cannot accept non-offered admission');
    }

    if (!this.isOfferValid()) {
      throw new Error('Admission offer has expired');
    }

    this.status = 'accepted';
    this.acceptedDate = new Date();
    this.updatedAt = new Date();
  }

  // Decline admission offer
  decline() {
    if (this.status !== 'offered') {
      throw new Error('Cannot decline non-offered admission');
    }

    this.status = 'declined';
    this.declinedDate = new Date();
    this.updatedAt = new Date();
  }
}

module.exports = Admission;