package com.lawfirm.brs.config;

import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.env.PropertiesPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.core.io.support.PropertySourceFactory;
import org.springframework.lang.NonNull;

import java.util.Objects;
import java.util.Properties;

/**
 * PropertySourceFactory for loading YAML configuration files.
 * Enables @PropertySource to work with .yml/.yaml files.
 */
public class YamlPropertySourceFactory implements PropertySourceFactory {

    @Override
    @NonNull
    public PropertySource<?> createPropertySource(String name, EncodedResource resource) {
        YamlPropertiesFactoryBean factory = new YamlPropertiesFactoryBean();
        factory.setResources(resource.getResource());
        Properties properties = factory.getObject();
        
        String sourceName = name != null ? name : resource.getResource().getFilename();
        
        return new PropertiesPropertySource(
            Objects.requireNonNull(sourceName),
            Objects.requireNonNull(properties)
        );
    }
}
