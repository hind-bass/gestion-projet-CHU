package com.itchu.mapper;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

final class MapperUtils {

    private MapperUtils() {
    }

    static <T> List<T> copyList(Collection<T> source) {
        if (source == null || source.isEmpty()) {
            return List.of();
        }
        return new ArrayList<>(source);
    }
}
