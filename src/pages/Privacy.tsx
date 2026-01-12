import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12 px-4">
        <Link to="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Forum
          </Button>
        </Link>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-4xl font-display font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 12, 2026</p>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">1. Introduction</h2>
            <p>
              Moonwalk Forum ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our forum 
              service ("Service").
            </p>
            <p>
              Please read this Privacy Policy carefully. By using the Service, you consent to the collection 
              and use of information in accordance with this policy. If you do not agree with the terms of 
              this Privacy Policy, please do not access the Service.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mt-4">2.1 Personal Information</h3>
            <p>We may collect personally identifiable information that you voluntarily provide, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address, username, password (encrypted), and display name</li>
              <li><strong>Profile Information:</strong> Avatar image, bio, and other profile details you choose to share</li>
              <li><strong>User Content:</strong> Posts, comments, messages, and any other content you submit</li>
              <li><strong>Communications:</strong> Information from your communications with us</li>
            </ul>

            <h3 className="text-xl font-medium mt-4">2.2 Automatically Collected Information</h3>
            <p>When you access the Service, we automatically collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
              <li><strong>Log Data:</strong> IP address, access times, pages viewed, and referring URL</li>
              <li><strong>Usage Data:</strong> Features used, actions taken, and interaction patterns</li>
              <li><strong>Cookies and Tracking:</strong> Session cookies, authentication tokens, and similar technologies</li>
            </ul>

            <h3 className="text-xl font-medium mt-4">2.3 Third-Party Information</h3>
            <p>
              If you authenticate using third-party services (e.g., Google), we may receive your name, 
              email address, and profile picture from that service.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and manage your account</li>
              <li>Provide, operate, and maintain the Service</li>
              <li>Process and complete transactions</li>
              <li>Send administrative information and notifications</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Monitor and analyze usage trends and preferences</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Enforce our Terms of Service and community guidelines</li>
              <li>Protect against fraud, abuse, and unauthorized access</li>
              <li>Comply with legal obligations</li>
              <li>Improve and personalize the Service</li>
            </ul>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">4. Information Sharing and Disclosure</h2>
            <p>We may share your information in the following circumstances:</p>
            
            <h3 className="text-xl font-medium mt-4">4.1 Public Information</h3>
            <p>
              Your username, display name, avatar, bio, posts, and comments are publicly visible to all 
              users and visitors of the Service.
            </p>

            <h3 className="text-xl font-medium mt-4">4.2 Service Providers</h3>
            <p>
              We may share information with third-party vendors who perform services on our behalf, such as 
              hosting, analytics, email delivery, and customer service. These providers are obligated to 
              protect your information.
            </p>

            <h3 className="text-xl font-medium mt-4">4.3 Legal Requirements</h3>
            <p>We may disclose your information if required to do so by law or in response to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Valid legal process (subpoenas, court orders)</li>
              <li>Government requests</li>
              <li>Protection of our rights, property, or safety</li>
              <li>Prevention of fraud or abuse</li>
              <li>Emergency situations involving potential threats to physical safety</li>
            </ul>

            <h3 className="text-xl font-medium mt-4">4.4 Business Transfers</h3>
            <p>
              In the event of a merger, acquisition, or sale of assets, your information may be transferred 
              as part of that transaction.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">5. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to 
              provide you with the Service. We may also retain certain information as required by law or 
              for legitimate business purposes, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Compliance with legal obligations</li>
              <li>Resolution of disputes</li>
              <li>Enforcement of agreements</li>
              <li>Protection against fraud and abuse</li>
            </ul>
            <p>
              Deleted content may persist in backups for a limited period but will not be accessible through 
              the Service.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your 
              personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Encrypted password storage using industry-standard hashing</li>
              <li>Row-level security policies for database access control</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls limiting employee access to personal data</li>
            </ul>
            <p>
              However, no method of transmission over the Internet or electronic storage is 100% secure. 
              We cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">7. Your Rights and Choices</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing of your data</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
            </ul>
            <p>
              To exercise these rights, please contact us through the forum's official channels. We will 
              respond to your request within a reasonable timeframe.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">8. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Authenticate users and maintain sessions</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze how the Service is used</li>
              <li>Prevent fraud and enhance security</li>
            </ul>
            <p>
              Most browsers allow you to control cookies through settings. Disabling cookies may affect 
              the functionality of the Service.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">9. Children's Privacy</h2>
            <p>
              The Service is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If we discover that we have collected personal 
              information from a child under 13, we will delete that information immediately.
            </p>
            <p>
              If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of 
              residence. These countries may have different data protection laws. By using the Service, you 
              consent to such transfers.
            </p>
            <p>
              We ensure appropriate safeguards are in place for international data transfers in compliance 
              with applicable law.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">11. Third-Party Links</h2>
            <p>
              The Service may contain links to third-party websites or services. We are not responsible for 
              the privacy practices of these third parties. We encourage you to review the privacy policies 
              of any third-party sites you visit.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
            <p>
              We encourage you to review this Privacy Policy periodically for any changes. Your continued 
              use of the Service after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">13. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us 
              through the forum's official contact channels.
            </p>
          </section>

          <section className="space-y-4 mb-8 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-2xl font-semibold">Your Privacy Rights Summary</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <h4 className="font-medium">🔒 Data Protection</h4>
                <p className="text-sm text-muted-foreground">Your data is encrypted and protected with industry-standard security.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">👁️ Transparency</h4>
                <p className="text-sm text-muted-foreground">We clearly explain what data we collect and why.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">🎛️ Control</h4>
                <p className="text-sm text-muted-foreground">You can access, correct, or delete your personal data.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">🚫 No Selling</h4>
                <p className="text-sm text-muted-foreground">We never sell your personal information to third parties.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
