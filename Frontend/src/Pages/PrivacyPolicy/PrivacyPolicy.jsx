import Footer from '../../Components/Footer/Footer';
import Header from '../../Components/Header/Header';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    return (
        <div className="main-container">
            <Header heading='Cyclic Tasks' />
            <div className="privacy-container">
                <div className="privacy">
                    <h1 style={{textAlign: 'center'}}>Privacy Policy</h1>
                    <p><strong>Effective Date:</strong> 15-October-2024</p>
                    <p>Your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your information when you use our service, CyclicTasks.</p>

                    <h2>1. Information We Collect</h2>
                    <p>When you use CyclicTasks, we collect the following information:</p>
                    <ul>
                        <li><strong>Email:</strong> Obtained from your Google account during sign-in.</li>
                        <li><strong>Name:</strong> Obtained from your Google account during sign-in.</li>
                        <li><strong>Target URL:</strong> The URL of your application, which you provide.</li>
                        <li><strong>Discord Webhook URL:</strong> An optional field for notifications.</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>We may use the information we collect from you for the following purposes:</p>
                    <ul>
                        <li>To provide, maintain, and improve our service.</li>
                        <li>To monitor usage and prevent abuse of the service.</li>
                        <li>To communicate with you regarding your account or our services.</li>
                    </ul>

                    <h2>3. Data Protection</h2>
                    <p>We are committed to protecting your data. We implement a variety of security measures to maintain the safety of your personal information. However, please remember that no method of transmission over the Internet or method of electronic storage is 100% secure.</p>

                    <h2>4. Sharing Your Information</h2>
                    <p>We do not sell, trade, or otherwise transfer your personal information to outside parties without your consent, except as required by law. Your information may be shared with trusted third parties who assist us in operating our website and conducting our business, so long as those parties agree to keep this information confidential.</p>

                    <h2>5. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Request access to the personal information we hold about you.</li>
                        <li>Request correction of any inaccurate personal information.</li>
                        <li>Request deletion of your personal information.</li>
                    </ul>

                    <h2>6. Changes to This Privacy Policy</h2>
                    <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

                    <h2>7. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                    <p><strong>Email:</strong> darkglance.developer@gmail.com</p>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default PrivacyPolicy;
