package at.fhtw.documentmanagementsystem.business.mapper;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public abstract class AbstractMapper<E, D> {

    public abstract D mapToDto(E entity);

    public final List<D> mapToDto(Collection<E> entities) {
        List<D> dtos = new ArrayList<>();
        entities.forEach(entity -> dtos.add(mapToDto(entity)));
        return sort(dtos);
    }

    protected List<D> sort(List<D> unsortedList) {
        return unsortedList;
    }
}
