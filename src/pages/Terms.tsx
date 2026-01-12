import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Terms() {
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
          <h1 className="text-4xl font-display font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 12, 2026</p>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Moonwalk Forum ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you do not agree to these Terms, you may not access or use the Service. These Terms constitute a legally 
              binding agreement between you and Moonwalk Forum.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by 
              posting the updated Terms on the Service. Your continued use of the Service after such changes constitutes 
              your acceptance of the new Terms.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">2. Eligibility</h2>
            <p>
              You must be at least 13 years of age to use this Service. By using the Service, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are at least 13 years old</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You are not prohibited from using the Service under applicable law</li>
              <li>Your use of the Service does not violate any applicable law or regulation</li>
            </ul>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">3. User Accounts</h2>
            <p>
              To access certain features of the Service, you must create an account. When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate your account if any information provided is inaccurate, 
              incomplete, or violates these Terms.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">4. User Content</h2>
            <p>
              You retain ownership of content you post on the Service ("User Content"). By posting User Content, 
              you grant us a non-exclusive, worldwide, royalty-free, sublicensable, and transferable license to use, 
              reproduce, distribute, prepare derivative works of, display, and perform your User Content in connection 
              with the Service.
            </p>
            <p>You represent and warrant that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You own or have the necessary rights to post the User Content</li>
              <li>Your User Content does not violate the rights of any third party</li>
              <li>Your User Content complies with these Terms and all applicable laws</li>
            </ul>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">5. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or invasive of another's privacy</li>
              <li>Engage in hate speech or discrimination based on race, ethnicity, religion, gender, sexual orientation, disability, or national origin</li>
              <li>Impersonate any person or entity or falsely state your affiliation with any person or entity</li>
              <li>Post spam, advertisements, or solicitations without authorization</li>
              <li>Transmit viruses, malware, or other malicious code</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Collect or harvest user data without consent</li>
              <li>Use the Service for any illegal purpose</li>
              <li>Circumvent or disable any security features of the Service</li>
              <li>Create multiple accounts for deceptive or abusive purposes</li>
              <li>Engage in doxxing, stalking, or targeted harassment of other users</li>
            </ul>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">6. Moderation and Enforcement</h2>
            <p>
              We reserve the right, but are not obligated, to monitor, edit, or remove any User Content. 
              We may take any action we deem necessary, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Issuing warnings for policy violations</li>
              <li>Temporarily or permanently suspending accounts</li>
              <li>Removing or editing content that violates these Terms</li>
              <li>Reporting illegal activities to law enforcement</li>
              <li>Implementing shadow bans or other moderation measures</li>
            </ul>
            <p>
              Our strike system applies escalating consequences for repeated violations, from warnings to 
              temporary restrictions to permanent account suspension.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding User Content), features, and functionality are 
              owned by Moonwalk Forum and are protected by international copyright, trademark, patent, trade 
              secret, and other intellectual property laws.
            </p>
            <p>
              You may not copy, modify, distribute, sell, or lease any part of our Service without our prior 
              written consent.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">8. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER 
              EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES 
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              We do not warrant that the Service will be uninterrupted, secure, or error-free, or that any 
              defects will be corrected.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MOONWALK FORUM SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, 
              WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE 
              LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">10. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Moonwalk Forum, its officers, directors, 
              employees, agents, and affiliates from and against any claims, liabilities, damages, losses, 
              and expenses, including reasonable attorneys' fees, arising out of or in any way connected with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your access to or use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party right</li>
              <li>Your User Content</li>
            </ul>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">11. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior 
              notice or liability, for any reason, including breach of these Terms. Upon termination, your 
              right to use the Service will cease immediately.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
              in which Moonwalk Forum operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">13. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us through the forum's official 
              contact channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
