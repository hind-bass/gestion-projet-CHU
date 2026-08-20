package com.itchu.domain;

import com.itchu.domain.enums.TaskStatus;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 255)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus statut;

    @Column(nullable = false)
    private Double priorite = 0.0;

    private LocalDate echeance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id")
    private User responsable;

    @ElementCollection
    @BatchSize(size = 32)
    @CollectionTable(name = "task_tags", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "tag", length = 100)
    private List<String> tagsCompetences = new ArrayList<>();

    @Column(name = "heures_estimees", nullable = false)
    private Double heuresEstimees = 8.0;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_maj", nullable = false)
    private LocalDateTime dateMaj;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (dateCreation == null) {
            dateCreation = now;
        }
        dateMaj = now;
    }

    @PreUpdate
    void onUpdate() {
        dateMaj = LocalDateTime.now();
    }

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatut() {
        return statut;
    }

    public void setStatut(TaskStatus statut) {
        this.statut = statut;
    }

    public Double getPriorite() {
        return priorite;
    }

    public void setPriorite(Double priorite) {
        this.priorite = priorite;
    }

    public LocalDate getEcheance() {
        return echeance;
    }

    public void setEcheance(LocalDate echeance) {
        this.echeance = echeance;
    }

    public User getResponsable() {
        return responsable;
    }

    public void setResponsable(User responsable) {
        this.responsable = responsable;
    }

    public List<String> getTagsCompetences() {
        return tagsCompetences;
    }

    public void setTagsCompetences(List<String> tagsCompetences) {
        this.tagsCompetences = tagsCompetences == null ? new ArrayList<>() : new ArrayList<>(tagsCompetences);
    }

    public Double getHeuresEstimees() {
        return heuresEstimees;
    }

    public void setHeuresEstimees(Double heuresEstimees) {
        this.heuresEstimees = heuresEstimees;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateMaj() {
        return dateMaj;
    }

    public void setDateMaj(LocalDateTime dateMaj) {
        this.dateMaj = dateMaj;
    }
}
