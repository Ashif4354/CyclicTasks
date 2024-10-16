import Footer from '../../Components/Footer/Footer';
import Header from '../../Components/Header/Header';
import './TC.css';

const TermsAndConditions = () => {
    return (
        <div className="main-container">
            <Header heading='Cyclic Tasks' />
            <div className="terms-container">
                <div className="terms">
                    <h1 style={{textAlign: 'center'}}>Terms and Conditions</h1>
                    <p><strong>Effective Date:</strong> 15-October-2024</p>
                    <p>Welcome to CyclicTasks! By using our service, you agree to comply with and be bound by the following terms and conditions. If you do not agree with these terms, please do not use our service.</p>

                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing or using CyclicTasks, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>

                    <h2>2. Service Description</h2>
                    <p>CyclicTasks provides a web-based application that allows users to keep their backend applications active by sending automated pulse signals to ensure 24/7 uptime, particularly for those using free hosting services.</p>

                    <h2>3. User Account</h2>
                    <p>To use CyclicTasks, you must sign in using your Google account. By doing so, you agree to provide accurate and complete information, including your email address and name. You may also provide a target URL of your application and an optional Discord webhook URL for notifications.</p>

                    <h2>4. User Data Collection</h2>
                    <p>We collect the following information:</p>
                    <ul>
                        <li><strong>Email:</strong> Obtained from your Google account.</li>
                        <li><strong>Name:</strong> Obtained from your Google account.</li>
                        <li><strong>Target URL:</strong> The URL of your application.</li>
                        <li><strong>Discord Webhook URL:</strong> Optional field for notifications.</li>
                    </ul>
                    <p>We are committed to protecting your data and will not share it with third parties without your consent, except as required by law.</p>

                    <h2>5. User Responsibilities</h2>
                    <p>You agree not to:</p>
                    <ul>
                        <li>Use the service for any illegal or unauthorized purposes.</li>
                        <li>Create excessive tasks that may overload our system.</li>
                        <li>Abuse the service by sending automated requests at unreasonable frequencies.</li>
                        <li>Violate the terms of service of any third-party services connected to your application.</li>
                    </ul>

                    <h2>6. Admin Rights</h2>
                    <p>As the admin, we reserve the right to:</p>
                    <ul>
                        <li>Block you or suspend your tasks if we determine that your usage violates these Terms and Conditions.</li>
                        <li>Monitor user activity to ensure compliance with these terms.</li>
                    </ul>

                    <h2>7. Termination</h2>
                    <p>We reserve the right to terminate or suspend access to the service at our discretion, without prior notice or liability, for any reason, including, but not limited to, violations of these Terms and Conditions.</p>

                    <h2>8. Limitation of Liability</h2>
                    <p>In no event shall CyclicTasks or its affiliates be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
                    <ul>
                        <li>Your access to or use of (or inability to access or use) the service.</li>
                        <li>Any conduct or content of any third party on the service.</li>
                        <li>Any content obtained from the service.</li>
                    </ul>

                    <h2>9. Changes to Terms</h2>
                    <p>We may update these Terms and Conditions from time to time. We will notify you of any changes by posting the new Terms on this page. You are advised to review these Terms periodically for any changes.</p>

                    <h2>10. Governing Law</h2>
                    <p>These Terms and Conditions shall be governed by and construed in accordance with the Constitution of India. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in India.</p>

                    <h2>11. Contact Us</h2>
                    <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
                    <p><strong>Email:</strong> darkglance.developer@gmail.com</p>
                </div>
            </div>  
            <Footer />
        </div>
    );
}

export default TermsAndConditions;
