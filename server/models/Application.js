class Application {
  constructor(data) {
    this.id = data.id;
    this.studentId = data.studentId;
    this.institutionId = data.institutionId;
    this.facultyId = data.facultyId;
    this.courseId = data.courseId;
    this.applicationDate = data.applicationDate || new Date();
    this.status = data.status || 'pending'; // pending, under-review, admitted, rejected, waiting, accepted
    this.priority = data.priority || 1;
    this.documents = data.documents || [];
    this.studentName = data.studentName;
    this.studentEmail = data.studentEmail;
    this.courseName = data.courseName;
    this.institutionName = data.institutionName;
    this.meetsRequirements = data.meetsRequirements || false;
    this.waitlistPosition = data.waitlistPosition;
    this.admissionDecision = data.admissionDecision;
    this.notes = data.notes;
    this.acceptedAt = data.acceptedAt;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toFirestore() {
    return {
      studentId: this.studentId,
      institutionId: this.institutionId,
      facultyId: this.facultyId,
      courseId: this.courseId,
      applicationDate: this.applicationDate,
      status: this.status,
      priority: this.priority,
      documents: this.documents,
      studentName: this.studentName,
      studentEmail: this.studentEmail,
      courseName: this.courseName,
      institutionName: this.institutionName,
      meetsRequirements: this.meetsRequirements,
      waitlistPosition: this.waitlistPosition,
      admissionDecision: this.admissionDecision,
      notes: this.notes,
      acceptedAt: this.acceptedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Application({
      id: doc.id,
      ...data
    });
  }

  // Validate application data
  validate() {
    const errors = [];

    if (!this.studentId) errors.push('Student ID is required');
    if (!this.institutionId) errors.push('Institution ID is required');
    if (!this.facultyId) errors.push('Faculty ID is required');
    if (!this.courseId) errors.push('Course ID is required');
    if (!this.studentName) errors.push('Student name is required');
    if (!this.studentEmail) errors.push('Student email is required');
    if (!this.courseName) errors.push('Course name is required');
    if (!this.institutionName) errors.push('Institution name is required');

    if (this.priority && (this.priority < 1 || this.priority > 2)) {
      errors.push('Priority must be 1 or 2');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check if application can be updated
  canUpdateStatus(newStatus) {
    const allowedTransitions = {
      'pending': ['under-review', 'admitted', 'rejected', 'waiting'],
      'under-review': ['admitted', 'rejected', 'waiting'],
      'waiting': ['admitted', 'rejected'],
      'admitted': ['accepted', 'rejected'],
      'rejected': [],
      'accepted': []
    };

    return allowedTransitions[this.status]?.includes(newStatus) || false;
  }

  // Update application status
  updateStatus(newStatus, notes = '') {
    if (!this.canUpdateStatus(newStatus)) {
      throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;
    this.notes = notes;
    this.updatedAt = new Date();

    if (newStatus === 'admitted' || newStatus === 'rejected') {
      this.admissionDecision = {
        decision: newStatus,
        decisionDate: new Date(),
        notes: notes
      };
    }

    if (newStatus === 'accepted') {
      this.acceptedAt = new Date();
    }
  }

  // Check if application is active
  isActive() {
    return ['pending', 'under-review', 'waiting', 'admitted'].includes(this.status);
  }
}

module.exports = Application;