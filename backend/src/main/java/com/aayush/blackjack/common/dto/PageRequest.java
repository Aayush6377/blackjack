package com.aayush.blackjack.common.dto;

import org.springframework.data.domain.Sort;

import java.util.Set;

public record PageRequest<T>(
        Integer page,
        Integer limit,
        String orderBy,
        String direction,
        String search,
        T filters
) {
    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_LIMIT = 10;
    private static final int MAX_LIMIT = 100;

    public int normalizedPage() {
        return (page == null || page < 0) ? DEFAULT_PAGE : page;
    }

    public int normalizedLimit() {
        if (limit == null || limit < 1) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }

    public String normalizedSearch() {
        return search == null ? "" : search.trim();
    }

    public Sort toSpringSort(Set<String> allowedSortFields, String defaultField) {
        String field = (orderBy != null && allowedSortFields.contains(orderBy))
                ? orderBy
                : defaultField;

        Sort.Direction sortDirection = "ASC".equalsIgnoreCase(direction)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return Sort.by(sortDirection, field);
    }

    public org.springframework.data.domain.PageRequest toPageable(
            Set<String> allowedSortFields,
            String defaultField
    ) {
        return org.springframework.data.domain.PageRequest.of(
                normalizedPage(),
                normalizedLimit(),
                toSpringSort(allowedSortFields, defaultField)
        );
    }
}