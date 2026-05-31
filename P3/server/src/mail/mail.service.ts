import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

const escHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEnrollmentConfirmation(
    to: string,
    nickname: string,
    courseName: string,
    amount: number,
  ): Promise<void> {
    const safeNickname = escHtml(nickname);
    const safeCourseName = escHtml(courseName);

    await this.mailerService.sendMail({
      to,
      subject: `[Solving Meal] "${safeCourseName}" 수강 신청 완료`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#333;">수강 신청이 완료되었습니다!</h2>
          <p>안녕하세요, <strong>${safeNickname}</strong>님.</p>
          <p><strong>${safeCourseName}</strong> 강의 결제가 완료되어 수강 신청되었습니다.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr>
              <td style="padding:10px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">강의명</td>
              <td style="padding:10px;border:1px solid #ddd;">${safeCourseName}</td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">결제 금액</td>
              <td style="padding:10px;border:1px solid #ddd;">${amount.toLocaleString()}원</td>
            </tr>
          </table>
          <p>지금 바로 강의를 시작해보세요!</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#888;font-size:12px;">Solving Meal — 자취생 맞춤형 요리 교육 플랫폼</p>
        </div>
      `,
    });
  }
}
