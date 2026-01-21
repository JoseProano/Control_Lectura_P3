package ec.edu.espe.orderservice.infrastructure.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ Configuration
 * Follows Single Responsibility Principle: Only configures messaging infrastructure
 */
@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.name}")
    private String exchangeName;

    @Value("${rabbitmq.queue.order-created}")
    private String orderCreatedQueue;

    @Value("${rabbitmq.queue.stock-response}")
    private String stockResponseQueue;

    @Value("${rabbitmq.routing-key.order-created}")
    private String orderCreatedRoutingKey;

    @Value("${rabbitmq.routing-key.stock-reserved}")
    private String stockReservedRoutingKey;

    @Value("${rabbitmq.routing-key.stock-rejected}")
    private String stockRejectedRoutingKey;

    /**
     * Exchange configuration
     */
    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchangeName);
    }

    /**
     * Queue for OrderCreated events (consumed by Inventory Service)
     */
    @Bean
    public Queue orderCreatedQueue() {
        return QueueBuilder
                .durable(orderCreatedQueue)
                .build();
    }

    /**
     * Queue for Stock responses (consumed by Order Service)
     */
    @Bean
    public Queue stockResponseQueue() {
        return QueueBuilder
                .durable(stockResponseQueue)
                .build();
    }

    /**
     * Binding: OrderCreated queue to exchange
     */
    @Bean
    public Binding orderCreatedBinding(Queue orderCreatedQueue, TopicExchange exchange) {
        return BindingBuilder
                .bind(orderCreatedQueue)
                .to(exchange)
                .with(orderCreatedRoutingKey);
    }

    /**
     * Binding: StockResponse queue to exchange (for both reserved and rejected)
     */
    @Bean
    public Binding stockReservedBinding(Queue stockResponseQueue, TopicExchange exchange) {
        return BindingBuilder
                .bind(stockResponseQueue)
                .to(exchange)
                .with(stockReservedRoutingKey);
    }

    @Bean
    public Binding stockRejectedBinding(Queue stockResponseQueue, TopicExchange exchange) {
        return BindingBuilder
                .bind(stockResponseQueue)
                .to(exchange)
                .with(stockRejectedRoutingKey);
    }

    /**
     * JSON Message Converter
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * RabbitTemplate with JSON converter
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
