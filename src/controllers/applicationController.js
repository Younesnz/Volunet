const Application = require('./applicationModel');

exports.getApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) throw Error('Application does not exist');
        res.json(application);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
};

exports.getApplications = async (req, res) => {
    try {
        if (!req.user.isAdmin) throw Error('You are not authorized');
        const applications = await Application.find(req.query);
        res.json(applications);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
};

exports.updateApplication = async (req, res) => {
    try {
        if (!req.user.isAdmin) throw Error('You are not authorized');
        const application = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!application) throw Error('Application does not exist');
        res.json(application);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        if (!req.user.isAdmin) throw Error('You are not authorized');
        const application = await Application.findByIdAndDelete(req.params.id);
        if (!application) throw Error('Application does not exist');
        res.json({ msg: 'Application deleted successfully' });
    } catch (e) {
        res.status(400).json({ msg: e.message});
}
};