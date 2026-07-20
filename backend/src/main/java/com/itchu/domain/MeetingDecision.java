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

@Entity
@Table(name = "meeting_decisions")
public class MeetingDecision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(name = "texte_decision", nullable = false, columnDefinition = "TEXT")
    private String texteDecision;

    @Column(name = "statut_traite", nullable = false)
    private boolean statutTraite = false;

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

    public String getTexteDecision() {
        return texteDecision;
    }

    public void setTexteDecision(String texteDecision) {
        this.texteDecision = texteDecision;
    }

    public boolean isStatutTraite() {
        return statutTraite;
    }

    public void setStatutTraite(boolean statutTraite) {
        this.statutTraite = statutTraite;
    }
}
