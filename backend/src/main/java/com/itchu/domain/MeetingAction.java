package com.itchu.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "meeting_actions")
public class MeetingAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(name = "texte_action", nullable = false, columnDefinition = "TEXT")
    private String texteAction;

    @Column(name = "intervenant_detecte", length = 150)
    private String intervenantDetecte;

    @Column(name = "date_detectee")
    private LocalDate dateDetectee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_generee_id")
    private Task taskGeneree;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Meeting getMeeting() {
        return meeting;
    }

    public void setMeeting(Meeting meeting) {
        this.meeting = meeting;
    }

    public String getTexteAction() {
        return texteAction;
    }

    public void setTexteAction(String texteAction) {
        this.texteAction = texteAction;
    }

    public String getIntervenantDetecte() {
        return intervenantDetecte;
    }

    public void setIntervenantDetecte(String intervenantDetecte) {
        this.intervenantDetecte = intervenantDetecte;
    }

    public LocalDate getDateDetectee() {
        return dateDetectee;
    }

    public void setDateDetectee(LocalDate dateDetectee) {
        this.dateDetectee = dateDetectee;
    }

    public Task getTaskGeneree() {
        return taskGeneree;
    }

    public void setTaskGeneree(Task taskGeneree) {
        this.taskGeneree = taskGeneree;
    }
}
