package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.LawyerDTO;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.entity.User;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-29T00:41:02+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class LawyerMapperImpl implements LawyerMapper {

    @Override
    public LawyerDTO toDTO(LawyerProfile lawyer) {
        if ( lawyer == null ) {
            return null;
        }

        LawyerDTO.LawyerDTOBuilder lawyerDTO = LawyerDTO.builder();

        lawyerDTO.userId( lawyerUserId( lawyer ) );
        lawyerDTO.userEmail( lawyerUserEmail( lawyer ) );
        lawyerDTO.id( lawyer.getId() );
        lawyerDTO.slug( lawyer.getSlug() );
        lawyerDTO.nameVi( lawyer.getNameVi() );
        lawyerDTO.nameEn( lawyer.getNameEn() );
        lawyerDTO.bioVi( lawyer.getBioVi() );
        lawyerDTO.bioEn( lawyer.getBioEn() );
        lawyerDTO.positionVi( lawyer.getPositionVi() );
        lawyerDTO.positionEn( lawyer.getPositionEn() );
        lawyerDTO.experienceYears( lawyer.getExperienceYears() );
        lawyerDTO.barNumber( lawyer.getBarNumber() );
        String[] languages = lawyer.getLanguages();
        if ( languages != null ) {
            lawyerDTO.languages( Arrays.copyOf( languages, languages.length ) );
        }
        lawyerDTO.avatarUrl( lawyer.getAvatarUrl() );
        lawyerDTO.isFeatured( lawyer.getIsFeatured() );
        lawyerDTO.workingHours( lawyer.getWorkingHours() );
        lawyerDTO.createdAt( lawyer.getCreatedAt() );

        return lawyerDTO.build();
    }

    @Override
    public LawyerDTO toDTOWithDetails(LawyerProfile lawyer) {
        if ( lawyer == null ) {
            return null;
        }

        LawyerDTO.LawyerDTOBuilder lawyerDTO = LawyerDTO.builder();

        lawyerDTO.userId( lawyerUserId( lawyer ) );
        lawyerDTO.userEmail( lawyerUserEmail( lawyer ) );
        lawyerDTO.id( lawyer.getId() );
        lawyerDTO.slug( lawyer.getSlug() );
        lawyerDTO.nameVi( lawyer.getNameVi() );
        lawyerDTO.nameEn( lawyer.getNameEn() );
        lawyerDTO.bioVi( lawyer.getBioVi() );
        lawyerDTO.bioEn( lawyer.getBioEn() );
        lawyerDTO.positionVi( lawyer.getPositionVi() );
        lawyerDTO.positionEn( lawyer.getPositionEn() );
        lawyerDTO.experienceYears( lawyer.getExperienceYears() );
        lawyerDTO.barNumber( lawyer.getBarNumber() );
        String[] languages = lawyer.getLanguages();
        if ( languages != null ) {
            lawyerDTO.languages( Arrays.copyOf( languages, languages.length ) );
        }
        lawyerDTO.avatarUrl( lawyer.getAvatarUrl() );
        lawyerDTO.isFeatured( lawyer.getIsFeatured() );
        lawyerDTO.workingHours( lawyer.getWorkingHours() );
        lawyerDTO.createdAt( lawyer.getCreatedAt() );

        return lawyerDTO.build();
    }

    @Override
    public List<LawyerDTO> toDTOList(List<LawyerProfile> lawyers) {
        if ( lawyers == null ) {
            return null;
        }

        List<LawyerDTO> list = new ArrayList<LawyerDTO>( lawyers.size() );
        for ( LawyerProfile lawyerProfile : lawyers ) {
            list.add( lawyerProfileToLawyerDTO( lawyerProfile ) );
        }

        return list;
    }

    @Override
    public List<LawyerDTO> toDTOListWithDetails(List<LawyerProfile> lawyers) {
        if ( lawyers == null ) {
            return null;
        }

        List<LawyerDTO> list = new ArrayList<LawyerDTO>( lawyers.size() );
        for ( LawyerProfile lawyerProfile : lawyers ) {
            list.add( lawyerProfileToLawyerDTO( lawyerProfile ) );
        }

        return list;
    }

    private UUID lawyerUserId(LawyerProfile lawyerProfile) {
        if ( lawyerProfile == null ) {
            return null;
        }
        User user = lawyerProfile.getUser();
        if ( user == null ) {
            return null;
        }
        UUID id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String lawyerUserEmail(LawyerProfile lawyerProfile) {
        if ( lawyerProfile == null ) {
            return null;
        }
        User user = lawyerProfile.getUser();
        if ( user == null ) {
            return null;
        }
        String email = user.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    protected LawyerDTO lawyerProfileToLawyerDTO(LawyerProfile lawyerProfile) {
        if ( lawyerProfile == null ) {
            return null;
        }

        LawyerDTO.LawyerDTOBuilder lawyerDTO = LawyerDTO.builder();

        lawyerDTO.id( lawyerProfile.getId() );
        lawyerDTO.slug( lawyerProfile.getSlug() );
        lawyerDTO.nameVi( lawyerProfile.getNameVi() );
        lawyerDTO.nameEn( lawyerProfile.getNameEn() );
        lawyerDTO.bioVi( lawyerProfile.getBioVi() );
        lawyerDTO.bioEn( lawyerProfile.getBioEn() );
        lawyerDTO.positionVi( lawyerProfile.getPositionVi() );
        lawyerDTO.positionEn( lawyerProfile.getPositionEn() );
        lawyerDTO.experienceYears( lawyerProfile.getExperienceYears() );
        lawyerDTO.barNumber( lawyerProfile.getBarNumber() );
        String[] languages = lawyerProfile.getLanguages();
        if ( languages != null ) {
            lawyerDTO.languages( Arrays.copyOf( languages, languages.length ) );
        }
        lawyerDTO.avatarUrl( lawyerProfile.getAvatarUrl() );
        lawyerDTO.isFeatured( lawyerProfile.getIsFeatured() );
        lawyerDTO.workingHours( lawyerProfile.getWorkingHours() );
        lawyerDTO.createdAt( lawyerProfile.getCreatedAt() );

        return lawyerDTO.build();
    }
}
