const { admin, db } = require('../config/firebaseAdmin');

class CompanyController {
  // Get company profile
  async getCompanyProfile(req, res) {
    try {
      const companyId = req.user.uid;

      const companyDoc = await db.collection('companies').doc(companyId).get();
      const userDoc = await db.collection('users').doc(companyId).get();

      if (!companyDoc.exists || !userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Company profile not found'
        });
      }

      const companyData = companyDoc.data();
      const userData = userDoc.data();

      res.json({
        success: true,
        data: {
          ...companyData,
          ...userData,
          id: companyId
        }
      });

    } catch (error) {
      console.error('Get company profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company profile'
      });
    }
  }

  // Update company profile
  async updateCompanyProfile(req, res) {
    try {
      const companyId = req.user.uid;
      const updates = req.body;

      // Update company collection
      if (updates.companyName || updates.industry || updates.size || 
          updates.website || updates.description || updates.location) {
        
        const companyUpdates = {};
        if (updates.companyName) companyUpdates.name = updates.companyName;
        if (updates.industry) companyUpdates.industry = updates.industry;
        if (updates.size) companyUpdates.size = updates.size;
        if (updates.website) companyUpdates.website = updates.website;
        if (updates.description) companyUpdates.description = updates.description;
        if (updates.location) companyUpdates.location = updates.location;

        companyUpdates.updatedAt = new Date();

        await db.collection('companies').doc(companyId).update(companyUpdates);
      }

      // Update users collection
      const userUpdates = {};
      if (updates.firstName) userUpdates.firstName = updates.firstName;
      if (updates.lastName) userUpdates.lastName = updates.lastName;
      if (updates.phone) userUpdates.phone = updates.phone;
      if (updates.companyName) userUpdates.companyName = updates.companyName;
      if (updates.contactPerson) userUpdates.contactPerson = `${updates.firstName} ${updates.lastName}`;

      userUpdates.updatedAt = new Date();

      await db.collection('users').doc(companyId).update(userUpdates);

      res.json({
        success: true,
        message: 'Company profile updated successfully'
      });

    } catch (error) {
      console.error('Update company profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update company profile'
      });
    }
  }

  // Get company's job postings
  async getCompanyJobs(req, res) {
    try {
      const companyId = req.user.uid;

      const jobsSnapshot = await db.collection('jobs')
        .where('companyId', '==', companyId)
        .orderBy('createdAt', 'desc')
        .get();

      const jobs = [];
      jobsSnapshot.forEach(doc => {
        jobs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.json({
        success: true,
        data: jobs
      });

    } catch (error) {
      console.error('Get company jobs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company jobs'
      });
    }
  }

  // Get company dashboard stats
  async getCompanyStats(req, res) {
    try {
      const companyId = req.user.uid;

      const [jobsSnapshot, applicationsSnapshot] = await Promise.all([
        db.collection('jobs').where('companyId', '==', companyId).get(),
        db.collection('jobApplications').where('companyId', '==', companyId).get()
      ]);

      const jobs = jobsSnapshot.docs.map(doc => doc.data());
      const applications = applicationsSnapshot.docs.map(doc => doc.data());

      const stats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === 'open').length,
        totalApplications: applications.length,
        qualifiedApplications: applications.filter(app => app.status === 'shortlisted').length,
        applicationStatus: applications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {})
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get company stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company statistics'
      });
    }
  }
}

module.exports = new CompanyController();