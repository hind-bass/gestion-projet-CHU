package com.itchu.domain;

import com.itchu.domain.enums.MeetingProcessingStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "meetings")
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 255)
    private String titre;

    @Column(nullable = false)
    private LocalDateTime date;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "meeting_participants",
            joinColumns = @JoinColumn(name = "meeting_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> participants = new HashSet<>();

    @Column(name = "ordre_du_jour", columnDefinition = "TEXT")
    private String ordreDuJour;

    @Column(name = "transcription_brute", columnDefinition = "LONGTEXT")
    private String transcriptionBrute;

    @Column(name = "resume_genere", columnDefinition = "LONGTEXT")
    private String resumeGenere;

    @Column(name = "notes_manuelles", columnDefinition = "TEXT")
    private String notesManuelles;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_traitement", nullable = false, length = 20)
    private MeetingProcessingStatus statutTraitement = MeetingProcessingStatus.EN_ATTENTE;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public Set<User> getParticipants() {
        return participants;
    }

    public void setParticipants(Set<User> participants) {
        this.participants = participants;
    }

    public String getOrdreDuJour() {
        return ordreDuJour;
    }

    public void setOrdreDuJour(String ordreDuJour) {
        this.ordreDuJour = ordreDuJour;
    }

    public String getTranscriptionBrute() {
        return transcriptionBrute;
    }

    public void setTranscriptionBrute(String transcriptionBrute) {
        this.transcriptionBrute = transcriptionBrute;
    }

    public String getResumeGenere() {
        return resumeGenere;
    }

    public void setResumeGenere(String resumeGenere) {
        this.resumeGenere = resumeGenere;
    }

    public String getNotesManuelles() {
        return notesManuelles;
    }

    public void setNotesManuelles(String notesManuelles) {
        this.notesManuelles = notesManuelles;
    }

    public MeetingProcessingStatus getStatutTraitement() {
        return statutTraitement;
    }

    public void setStatutTraitement(MeetingProcessingStatus statutTraitement) {
        this.statutTraitement = statutTraitement;
    }
}
