package com.lawfirm.brs.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ configuration for async messaging.
 */
@Configuration
public class RabbitMQConfig {

    public static final String NOTIFICATION_QUEUE = "brs.notifications";
    public static final String EMAIL_QUEUE = "brs.email";
    public static final String SMS_QUEUE = "brs.sms";
    public static final String OUTBOX_QUEUE = "brs.outbox";
    
    public static final String NOTIFICATION_EXCHANGE = "brs.notification.exchange";
    public static final String NOTIFICATION_ROUTING_KEY = "notification.#";

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(NOTIFICATION_QUEUE)
            .withArgument("x-dead-letter-exchange", "brs.dlx")
            .withArgument("x-dead-letter-routing-key", "notification.failed")
            .build();
    }

    @Bean
    public Queue emailQueue() {
        return QueueBuilder.durable(EMAIL_QUEUE).build();
    }

    @Bean
    public Queue smsQueue() {
        return QueueBuilder.durable(SMS_QUEUE).build();
    }

    @Bean
    public Queue outboxQueue() {
        return QueueBuilder.durable(OUTBOX_QUEUE).build();
    }

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(notificationQueue)
            .to(notificationExchange)
            .with("notification.#");
    }

    @Bean
    public Binding emailBinding(Queue emailQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(emailQueue)
            .to(notificationExchange)
            .with("email.#");
    }

    @Bean
    public Binding smsBinding(Queue smsQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(smsQueue)
            .to(notificationExchange)
            .with("sms.#");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
