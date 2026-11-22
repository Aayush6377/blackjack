package com.aayush.blackjack.config;

import com.aayush.blackjack.plan.dto.ChipPlanResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import tools.jackson.databind.JavaType;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.type.TypeFactory;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class RedisCacheConfig {

    @Bean
    public Map<String, RedisCacheConfiguration> customCacheConfigurations(
            RedisCacheConfiguration defaultRedisCacheConfig
    ) {
        Map<String, RedisCacheConfiguration> configs = new LinkedHashMap<>();

        configs.put("plans", plansCacheConfig(defaultRedisCacheConfig));

        return configs;
    }

    private RedisCacheConfiguration plansCacheConfig(RedisCacheConfiguration defaultConfig) {
        JsonMapper planMapper = JsonMapper.builder().findAndAddModules().build();
        JavaType planListType = TypeFactory.createDefaultInstance()
                .constructCollectionType(List.class, ChipPlanResponse.class);
        JacksonJsonRedisSerializer<List<ChipPlanResponse>> planListSerializer =
                new JacksonJsonRedisSerializer<>(planMapper, planListType);

        return defaultConfig
                .entryTtl(Duration.ofMinutes(15))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(planListSerializer)
                );
    }
}