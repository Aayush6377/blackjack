package com.aayush.blackjack.notification.service;

import com.aayush.blackjack.notification.dto.NotificationRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService implements NotificationService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.mail.sender-name}")
    private String senderName;

    @Override
    @Async("notificationTaskExecutor")
    public void sendNotification(NotificationRequest request) {
        String templatePath = request.template().getTemplatePath();
        try {
            Context thymeleafContext = new Context(Locale.ENGLISH);
            thymeleafContext.setVariables(request.variables());

            String htmlBody = templateEngine.process(templatePath, thymeleafContext);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    mimeMessage,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            helper.setFrom(String.format("%s <%s>", senderName, fromEmail));
            helper.setTo(request.recipient());
            helper.setSubject(request.subject());
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);

        } catch (MessagingException | MailException e) {
            log.error("Failed to send HTML email [template={}] to [{}]: {}", request.template(), request.recipient(), e.getMessage(), e);
        }
    }
}
